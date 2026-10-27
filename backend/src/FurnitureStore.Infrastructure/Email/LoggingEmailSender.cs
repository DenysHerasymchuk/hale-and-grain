using System.Net;
using FurnitureStore.Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace FurnitureStore.Infrastructure.Email;

/// <summary>
/// Development stand-in for an email provider: account emails are written to the log so
/// password resets can be completed locally. Replace with a real IEmailSender (SMTP, SES,
/// Postmark...) before going live.
/// </summary>
public class LoggingEmailSender(IConfiguration config, ILogger<LoggingEmailSender> logger) : IEmailSender<AppUser>
{
    private string FrontendUrl => config["Frontend:BaseUrl"] ?? "http://localhost:5173";

    public Task SendConfirmationLinkAsync(AppUser user, string email, string confirmationLink)
    {
        // Identity HTML-encodes links for email bodies; a log line needs the plain URL.
        logger.LogInformation("[email to {Email}] Confirm your account: {Link}", email, WebUtility.HtmlDecode(confirmationLink));
        return Task.CompletedTask;
    }

    public Task SendPasswordResetLinkAsync(AppUser user, string email, string resetLink)
    {
        logger.LogInformation("[email to {Email}] Reset your password: {Link}", email, WebUtility.HtmlDecode(resetLink));
        return Task.CompletedTask;
    }

    public Task SendPasswordResetCodeAsync(AppUser user, string email, string resetCode)
    {
        var link = $"{FrontendUrl}/reset-password?email={Uri.EscapeDataString(email)}&code={Uri.EscapeDataString(resetCode)}";
        logger.LogInformation("[email to {Email}] Reset your password: {Link}", email, link);
        return Task.CompletedTask;
    }
}
