using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.Net;
using System.Net.Mail;
using System.Text;

namespace MdLabScience.Utility
{
    // Outbound email through the SmarterASP mail servers configured in the
    // "Smtp" section of appsettings.json. The secure server (mail5017.site4now.net,
    // STARTTLS on 587) is tried first, then the plain port 8889 on the same host
    // in case the ISP blocks the first one.
    public static class EmailService
    {
        // Owner/authoritative inbox that receives registration + upgrade emails.
        public static string NotifyEmail(IConfiguration config)
        {
            return config["Smtp:NotifyEmail"] ?? "professionalh270@gmail.com";
        }

        // Sends to the configured owner inbox. Returns true when the mail was accepted.
        public static bool SendToAdmin(IConfiguration config, string subject, string htmlBody, out string error)
        {
            return Send(config, NotifyEmail(config), subject, htmlBody, out error);
        }

        // Fire-and-forget variant for notifications that must never block or fail
        // the caller (e.g. new trial registration while the signup request runs).
        public static void SendToAdminFireAndForget(IConfiguration config, string subject, string htmlBody)
        {
            _ = Task.Run(() =>
            {
                try
                {
                    Send(config, NotifyEmail(config), subject, htmlBody, out _);
                }
                catch
                {
                    // Swallow: a mail problem must never crash a request.
                }
            });
        }

        // Fire-and-forget variant for arbitrary recipients (e.g. telling a user
        // their Pro request was approved or rejected).
        public static void SendFireAndForget(IConfiguration config, string to, string subject, string htmlBody)
        {
            _ = Task.Run(() =>
            {
                try
                {
                    Send(config, to, subject, htmlBody, out _);
                }
                catch
                {
                    // Swallow: a mail problem must never crash a request.
                }
            });
        }

        public static bool Send(IConfiguration config, string to, string subject, string htmlBody, out string error)
        {
            error = "";
            if (string.IsNullOrWhiteSpace(to))
            {
                error = "No recipient address configured (Smtp:NotifyEmail).";
                return false;
            }

            string from = config["Smtp:From"] ?? config["Smtp:UserName"] ?? "postmaster@crashcourseonlin.net";
            string fromName = config["Smtp:FromName"] ?? "Crash Course Online";
            string userName = config["Smtp:UserName"] ?? from;
            string password = config["Smtp:Password"] ?? "";

            var attempts = new List<(string Host, int Port, bool Ssl)>
            {
                (
                    config["Smtp:Host"] ?? "mail5017.site4now.net",
                    ReadInt(config["Smtp:Port"], 587),
                    ReadBool(config["Smtp:EnableSsl"], true)
                ),
                (
                    config["Smtp:FallbackHost"] ?? "mail5017.site4now.net",
                    ReadInt(config["Smtp:FallbackPort"], 8889),
                    ReadBool(config["Smtp:FallbackEnableSsl"], false)
                ),
            };

            string lastError = "";
            foreach (var attempt in attempts)
            {
                if (string.IsNullOrWhiteSpace(attempt.Host)) continue;
                try
                {
                    using (SmtpClient client = new SmtpClient(attempt.Host, attempt.Port))
                    {
                        client.DeliveryMethod = SmtpDeliveryMethod.Network;
                        client.EnableSsl = attempt.Ssl;
                        client.UseDefaultCredentials = false;
                        client.Credentials = new NetworkCredential(userName, password);
                        client.Timeout = 20000;

                        using (MailMessage message = new MailMessage())
                        {
                            message.From = new MailAddress(from, fromName);
                            message.To.Add(to.Trim());
                            message.Subject = subject;
                            message.IsBodyHtml = true;
                            message.Body = htmlBody;
                            client.Send(message);
                        }
                    }
                    return true;
                }
                catch (System.Exception ex)
                {
                    lastError = ex.Message;
                }
            }

            error = lastError;
            return false;
        }

        // Simple branded HTML email with a label/value table.
        public static string BuildInfoEmail(
            string title,
            string intro,
            IEnumerable<KeyValuePair<string, string>> rows,
            string footer)
        {
            StringBuilder sb = new StringBuilder();
            sb.Append("<html><body style=\"font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1f2937;background:#f3f4f6;padding:16px;margin:0;\">");
            sb.Append("<div style=\"max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;\">");
            sb.Append("<div style=\"background:#C41E3A;padding:14px 18px;\"><span style=\"color:#ffffff;font-size:17px;font-weight:bold;\">");
            sb.Append(WebUtility.HtmlEncode(title));
            sb.Append("</span></div>");
            sb.Append("<div style=\"padding:16px 18px;\">");
            if (!string.IsNullOrEmpty(intro))
            {
                sb.Append("<p style=\"margin:0 0 12px 0;line-height:1.5;\">");
                sb.Append(WebUtility.HtmlEncode(intro));
                sb.Append("</p>");
            }
            sb.Append("<table style=\"width:100%;border-collapse:collapse;\">");
            foreach (var row in rows)
            {
                sb.Append("<tr><td style=\"padding:7px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;width:160px;vertical-align:top;\">");
                sb.Append(WebUtility.HtmlEncode(row.Key));
                sb.Append("</td><td style=\"padding:7px 0;border-bottom:1px solid #f3f4f6;font-weight:600;word-break:break-word;\">");
                sb.Append(WebUtility.HtmlEncode(row.Value ?? ""));
                sb.Append("</td></tr>");
            }
            sb.Append("</table>");
            if (!string.IsNullOrEmpty(footer))
            {
                sb.Append("<p style=\"margin:14px 0 0 0;color:#6b7280;font-size:12px;line-height:1.5;\">");
                sb.Append(WebUtility.HtmlEncode(footer));
                sb.Append("</p>");
            }
            sb.Append("</div></div></body></html>");
            return sb.ToString();
        }

        private static int ReadInt(string? value, int fallback)
        {
            return int.TryParse(value, out int parsed) ? parsed : fallback;
        }

        private static bool ReadBool(string? value, bool fallback)
        {
            return bool.TryParse(value, out bool parsed) ? parsed : fallback;
        }
    }
}
