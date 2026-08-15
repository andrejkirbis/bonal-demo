<?php
// --- Temporary debug log (remove after confirming mail works) ---
$log = fopen(__DIR__ . '/mail_debug.log', 'a');
fwrite($log, "\n--- " . date('Y-m-d H:i:s') . " ---\n");
fwrite($log, "METHOD: " . ($_SERVER['REQUEST_METHOD'] ?? 'n/a') . "\n");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    fwrite($log, "Rejected: not POST\n");
    fclose($log);
    http_response_code(405);
    exit;
}

if (!empty($_POST['_gotcha'])) {
    fwrite($log, "Rejected: honeypot\n");
    fclose($log);
    http_response_code(200);
    exit;
}

// Changed from natalijaopresnik@siol.net to info@storitve-bonal.com
// (same mailbox the old Domenca CMS form uses — known to work on this server)
$to = 'info@storitve-bonal.com';

function clean($val) {
    return trim(strip_tags((string)$val));
}

$name    = clean($_POST['name']    ?? '');
$email   = trim((string)($_POST['email']   ?? ''));
$phone   = clean($_POST['phone']  ?? '');
$message = clean($_POST['message'] ?? '');

fwrite($log, "name=[{$name}] email=[{$email}] msg_len=" . strlen($message) . "\n");

if (strlen($name) < 2 || strlen($message) < 10 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    fwrite($log, "Rejected: validation failed\n");
    fclose($log);
    http_response_code(400);
    exit;
}

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

$headers  = "From: noreply@storitve-bonal.com\r\n";
$headers .= "Reply-To: {$email}\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "MIME-Version: 1.0\r\n";

$result = mail($to, $subject, $body, $headers);
$err    = error_get_last();

fwrite($log, "mail() returned: " . ($result ? 'TRUE' : 'FALSE') . "\n");
fwrite($log, "error_get_last: " . print_r($err, true) . "\n");
fclose($log);

http_response_code($result ? 200 : 500);
