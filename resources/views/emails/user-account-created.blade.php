@component('mail::message')
# Welcome to QSU Motor Pool System

Hello **{{ $user->name }}**,

Your account has been created for the QSU Motor Pool Services Request System. You can now submit vehicle requests and track their status.

## Your Login Credentials

**Email:** {{ $user->email }}  
**Temporary Password:** `{{ $temporaryPassword }}`

@component('mail::button', ['url' => route('login')])
Login to Your Account
@endcomponent

## Important Security Notice

⚠️ **Please change your password immediately after your first login** for security purposes.

## Your Account Details

- **Department:** {{ $user->department }}
- **Position:** {{ $user->position }}
- **Role:** Client

## What You Can Do

With your new account, you can:
- Submit vehicle requests online
- Track request status in real-time
- View your trip history
- Receive notifications about your requests

## Need Help?

If you have any questions or need assistance, please contact:
- **General Services Unit**
- **Email:** gsu@qsu.edu.ph
- **Phone:** (078) 692-1234

---

Thank you,  
**QSU Motor Pool Management**

@component('mail::subcopy')
If you did not request this account, please contact the administrator immediately at gsu@qsu.edu.ph
@endcomponent
@endcomponent