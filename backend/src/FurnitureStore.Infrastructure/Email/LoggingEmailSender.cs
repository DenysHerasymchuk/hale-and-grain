using System.Net;
using FurnitureStore.Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace FurnitureStore.Infrastructure.Email;

/// <summary>
/// Stand-in for an email provider. With <c>Email:LogLinks</c> on (local only) account emails are
/// written to the log so password resets can be completed; otherwise the links are dropped, since
/// a reset link in a log is a takeover for anyone who can read the logs. Replace with a real
/// IEmailSender (SMTP, SES, Postmark...) before going live.
/// </summary>
public class LoggingEmailSender(IConfiguration config, ILogger<LoggingEmailSender> logger) : IEmailSender<AppUser>
{
    private string FrontendUrl => config["Frontend:BaseUrl"] ?? "http://localhost:5173";

    private void Log(string email, string subject, string link)
    {
        if (config.GetValue<bool>("Email:LogLinks"))
        {
            logger.LogInformation("[email to {Email}] {Subject}: {Link}", email, subject, link);
        }
        else
        {
            logger.LogWarning("No email provider configured; dropped \"{Subject}\" email", subject);
        }
    }

    public Task SendConfirmationLinkAsync(AppUser user, string email, string confirmationLink)
    {
        // Identity HTML-encodes links for email bodies; a log line needs the plain URL.
        Log(email, "Confirm your account", WebUtility.HtmlDecode(confirmationLink));
        return Task.CompletedTask;
    }

    public Task SendPasswordResetLinkAsync(AppUser user, string email, string resetLink)
    {
        Log(email, "Reset your password", WebUtility.HtmlDecode(resetLink));
        return Task.CompletedTask;
    }

    public Task SendPasswordResetCodeAsync(AppUser user, string email, string resetCode)
    {
        var link = $"{FrontendUrl}/reset-password?email={Uri.EscapeDataString(email)}&code={Uri.EscapeDataString(resetCode)}";
        Log(email, "Reset your password", link);
        return Task.CompletedTask;
    }
}
