<?php
$log = fopen(__DIR__ . '/mail_debug.log', 'a');
fwrite($log, "\n--- " . date('Y-m-d H:i:s') . " ---\n");
fwrite($log, "METHOD: " . ($_SERVER['REQUEST_METHOD'] ?? 'n/a') . "\n");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    fwrite($log, "Rejected: not POST\n");
    fclose($log);
    http_response_code(405);
    exit;
}

// Honeypot (re-enable after first successful test)
// $gotcha_raw = $_POST['_gotcha'] ?? '';
// if (!empty($gotcha_raw)) {
//     fwrite($log, "Rejected: honeypot [" . addslashes($gotcha_raw) . "]\n");
//     fclose($log);
//     http_response_code(200);
//     exit;
// }

$cfg_path = __DIR__ . '/smtp_config.php';
if (!file_exists($cfg_path)) {
    fwrite($log, "FATAL: smtp_config.php missing\n");
    fclose($log);
    http_response_code(500);
    exit;
}
$cfg = require $cfg_path;

require __DIR__ . '/phpmailer/Exception.php';
require __DIR__ . '/phpmailer/PHPMailer.php';
require __DIR__ . '/phpmailer/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception as MailException;

function clean($val) { return trim(strip_tags((string)$val)); }

$name    = clean($_POST['name']    ?? '');
$email   = trim((string)($_POST['email']   ?? ''));
$phone   = clean($_POST['phone']   ?? '');
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

$mail = new PHPMailer(true);
try {
    $mail->isSMTP();
    $mail->Host       = $cfg['host'];
    $mail->SMTPAuth   = true;
    $mail->Username   = $cfg['username'];
    $mail->Password   = $cfg['password'];
    $mail->SMTPSecure = ($cfg['port'] === 587)
        ? PHPMailer::ENCRYPTION_STARTTLS
        : PHPMailer::ENCRYPTION_SMTPS;
    $mail->Port       = $cfg['port'];

    $mail->setFrom($cfg['from'], 'BONAL spletna stran');
    $mail->addAddress($cfg['to']);
    $mail->addReplyTo($email, $name);

    $mail->isHTML(false);
    $mail->CharSet = 'UTF-8';
    $mail->Subject = 'Novo povpraševanje s spletne strani BONAL';

    $body  = "Novo povpraševanje — spletna stran BONAL\n";
    $body .= str_repeat('=', 45) . "\n\n";
    $body .= "Ime in priimek : {$name}\n";
    $body .= "E-pošta        : {$email}\n";
    if ($phone !== '') { $body .= "Telefon        : {$phone}\n"; }
    $body .= "\nSporočilo:\n{$message}\n";

    $mail->Body = $body;
    $mail->send();

    fwrite($log, "PHPMailer: sent OK\n");
    fclose($log);
    http_response_code(200);
} catch (MailException $e) {
    fwrite($log, "PHPMailer error: " . $mail->ErrorInfo . "\n");
    fclose($log);
    http_response_code(500);
}
