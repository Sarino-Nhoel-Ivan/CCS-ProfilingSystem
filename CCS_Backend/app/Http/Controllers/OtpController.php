<?php

namespace App\Http\Controllers;

use App\Models\Faculty;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;

class OtpController extends Controller
{
    /**
     * Send OTP to the given email.
     * role = 'faculty' | 'student'
     * Faculty: email must be @pnc.edu.com and not already registered.
     * Student: any valid email, not already registered in students table.
     */
    public function send(Request $request)
    {
        $request->validate([
            'email' => 'required|email|max:255',
            'role'  => 'required|in:faculty,student',
        ]);

        $email = strtolower(trim($request->email));
        $role  = $request->role;

        // Check not already registered in users table
        if (User::where('email', $email)->exists()) {
            return response()->json(['message' => 'This email address is already registered.'], 422);
        }

        // For faculty, also check faculties table
        if ($role === 'faculty' && Faculty::where('email', $email)->exists()) {
            return response()->json(['message' => 'This faculty email is already registered.'], 422);
        }

        // For student, also check students table
        if ($role === 'student' && Student::where('email', $email)->exists()) {
            return response()->json(['message' => 'This email address is already associated with a student account.'], 422);
        }

        $otp = (string) random_int(100000, 999999);
        Cache::put("otp:{$email}", $otp, now()->addMinutes(10));

        try {
            Mail::html($this->buildEmailHtml($otp), function ($message) use ($email) {
                $message->to($email)
                    ->subject('Your CCS Profiling System Verification Code');
            });
        } catch (\Throwable $e) {
            \Log::error('OTP mail error: ' . $e->getMessage());
        }

        return response()->json(['message' => 'OTP sent to your email. Valid for 10 minutes.']);
    }

    /**
     * Verify the OTP entered by the user.
     */
    public function verify(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp'   => 'required|string|size:6',
        ]);

        $email  = strtolower(trim($request->email));
        $stored = Cache::get("otp:{$email}");

        if (!$stored) {
            return response()->json(['message' => 'OTP has expired. Please request a new one.'], 422);
        }

        if ($stored !== $request->otp) {
            return response()->json(['message' => 'Incorrect OTP. Please try again.'], 422);
        }

        Cache::put("otp_verified:{$email}", true, now()->addMinutes(15));
        Cache::forget("otp:{$email}");

        return response()->json(['message' => 'Email verified successfully.']);
    }

    private function buildEmailHtml(string $otp): string
    {
        return <<<HTML
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="margin:0;padding:0;background:#0f172a;font-family:ui-sans-serif,system-ui,sans-serif;">
          <div style="max-width:480px;margin:40px auto;background:#1e293b;border-radius:20px;border:1px solid #334155;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#f26522,#f59e0b);padding:32px;text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">CCS Profiling System</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">Email Verification</p>
            </div>
            <div style="padding:36px 32px;">
              <p style="color:#94a3b8;font-size:14px;margin:0 0 8px;">Your verification code is:</p>
              <div style="background:#0f172a;border:2px dashed #f26522;border-radius:14px;padding:24px;text-align:center;margin:16px 0;">
                <span style="font-size:48px;font-weight:800;color:#f26522;letter-spacing:12px;font-family:monospace;">{$otp}</span>
              </div>
              <p style="color:#64748b;font-size:12px;margin:16px 0 0;text-align:center;">
                This code expires in <strong style="color:#94a3b8;">10 minutes</strong>.<br>
                Do not share this code with anyone.
              </p>
            </div>
            <div style="padding:16px 32px;border-top:1px solid #334155;text-align:center;">
              <p style="margin:0;color:#475569;font-size:11px;">© 2026 CCS Profiling System · All rights reserved</p>
            </div>
          </div>
        </body>
        </html>
        HTML;
    }
}
