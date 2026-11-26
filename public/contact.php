<?php
// Simple contact form handler for shared hosting (uses PHP's built-in mail()).
// TODO: set $to to the inbox that should receive enquiries.
$to       = 'hello@simplynsorted.com';
// Use an address on your own domain as the sender, or many inboxes will mark it as spam.
$from     = 'website@simplynsorted.com';
$subjectPrefix = 'New enquiry from simplynsorted.com';

// Folder this script lives in ('' on the live site, '/test' on the preview site),
// so redirects stay inside the same copy of the website.
$base = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'])), '/');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ' . $base . '/contact/');
    exit;
}

// Spam trap: bots fill hidden fields, people don't.
if (!empty($_POST['website'])) {
    header('Location: ' . $base . '/thank-you/');
    exit;
}

function clean($value, $max = 200) {
    $value = is_string($value) ? trim($value) : '';
    $value = str_replace(["\r", "\n", "%0a", "%0d"], ' ', $value); // block header injection
    return mb_substr(strip_tags($value), 0, $max);
}

$name    = clean($_POST['name'] ?? '', 100);
$company = clean($_POST['company'] ?? '', 100);
$email   = clean($_POST['email'] ?? '', 150);
$phone   = clean($_POST['phone'] ?? '', 30);
$message = mb_substr(strip_tags(trim($_POST['message'] ?? '')), 0, 3000);
$interests = [];
if (!empty($_POST['interest']) && is_array($_POST['interest'])) {
    foreach ($_POST['interest'] as $i) {
        $interests[] = clean($i, 50);
    }
}

if ($name === '' || $message === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    header('Location: ' . $base . '/contact/?error=invalid');
    exit;
}

$body  = "Name: $name\n";
$body .= "Company: " . ($company ?: '-') . "\n";
$body .= "Email: $email\n";
$body .= "Phone: " . ($phone ?: '-') . "\n";
$body .= "Interested in: " . ($interests ? implode(', ', $interests) : '-') . "\n\n";
$body .= "Message:\n$message\n";

$headers  = "From: Simply N Sorted Website <$from>\r\n";
$headers .= "Reply-To: $name <$email>\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

$subject = "$subjectPrefix: $name" . ($company ? " ($company)" : '');
$ok = mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, $headers);

header('Location: ' . $base . ($ok ? '/thank-you/' : '/contact/?error=send'));
exit;
