<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Account Created</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #f97316;
        }
        .header h1 {
            color: #f97316;
            margin: 0;
            font-size: 24px;
        }
        .content {
            margin-bottom: 30px;
        }
        .success-badge {
            background-color: #3b82f6;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            display: inline-block;
            margin-bottom: 20px;
            font-weight: 600;
        }
        .button {
            display: inline-block;
            background-color: #f97316;
            color: white;
            padding: 12px 32px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
        }
        .button:hover {
            background-color: #ea580c;
        }
        .credentials-box {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .password-display {
            background-color: #1f2937;
            color: #10b981;
            padding: 10px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 16px;
            font-weight: bold;
            letter-spacing: 1px;
            margin: 10px 0;
        }
        .warning-box {
            background-color: #fee2e2;
            border-left: 4px solid #ef4444;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚗 Motor Pool Services Request System</h1>
        </div>

        <div class="content">
            <div class="success-badge">🔐 Admin Account Created</div>
            
            <p>Hello <strong>{{ $userName }}</strong>,</p>
            
            <p>An administrator account has been created for you in the Motor Pool Services Request System.</p>
            
            <div class="credentials-box">
                <strong>Your Account Details:</strong><br>
                Email: {{ $userEmail }}<br>
                Role: {{ $userRole }}
            </div>
            
            <div class="warning-box">
                <strong>⚠️ Important: Your Temporary Password</strong><br>
                Please save this password securely. You will need it to log in:
                <div class="password-display">{{ $temporaryPassword }}</div>
                <small>For security reasons, please change your password after your first login.</small>
            </div>
            
            <p>Click the button below to log in and access your dashboard:</p>
            
            <div style="text-align: center;">
                <a href="{{ $loginUrl }}" class="button">Login to Your Account</a>
            </div>
            
            <p><strong>Security Tips:</strong></p>
            <ul>
                <li>Do not share your password with anyone</li>
                <li>Change your password immediately after first login</li>
                <li>Use a strong, unique password</li>
                <li>Log out when you're done using the system</li>
            </ul>
        </div>

        <div class="footer">
            <p>This is an automated message from the Motor Pool Services Request System.<br>
            If you did not expect this email, please contact the system administrator immediately.</p>
        </div>
    </div>
</body>
</html>