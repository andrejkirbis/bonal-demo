<?php
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit;
}

// Honeypot — bots fill this, humans leave it empty
if (!empty($_POST['_gotcha'])) {
    http_response_code(200);
    exit;
}

$to = 'natalijaopresnik@siol.net';

function clean($val) {
    return trim(strip_tags((string)$val));
}

$name    = clean($_POST['name']    ?? '');
$email   = trim((string)($_POST['email']   ?? ''));
$phone   = clean($_POST['phone']  ?? '');
$message = clean($_POST['message'] ?? '');

// Server-side validation
if (
    strlen($name) < 2 ||
    strlen($message) < 10 ||
    !filter_var($email, FILTER_VALIDATE_EMAIL)
) {
    http_response_code(400);
    exit;
}

// Prevent header injection
$name  = str_replace(["\r", "\n"], '', $name);
$email = str_replace(["\r", "\n"], '', $email);

$subject = '=?UTF-8?B?' . base64_encode('Novo povpraševanje s spletne strani BONAL') . '?=';

$body  = "Novo povpraševanje — spletna stran BONAL\n";
$body .= str_repeat('=', 45) . "\n\n";
$body .= "Ime in priimek : {$name}\n";
$body .= "E-pošta        : {$email}\n";
if ($phone !== '') {
    $body .= "Telefon        : {$phone}\n";
}
$body .= "\nSporočilo:\n{$message}\n";

$headers  = "From: Kontaktni obrazec BONAL <noreply@storitve-bonal.com>\r\n";
$headers .= "Reply-To: {$name} <{$email}>\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "X-Mailer: PHP/" . PHP_VERSION . "\r\n";

if (mail($to, $subject, $body, $headers)) {
    http_response_code(200);
} else {
    http_response_code(500);
}
