package com.wellsfargo.alertsiq.formbuilder.config;

import com.wellsfargo.alertsiq.formbuilder.entity.ComponentDefinition;
import com.wellsfargo.alertsiq.formbuilder.service.ComponentLibraryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * ComponentLibraryDataInitializer
 * ─────────────────────────────────
 * Runs once on application startup.
 * Seeds the COMPONENT_LIBRARY MongoDB collection with the standard
 * built-in component types if they don't already exist.
 *
 * Uses seedIfAbsent() so re-deploys are idempotent — existing records
 * are never overwritten.
 */
@Component
public class ComponentLibraryDataInitializer implements ApplicationRunner {

    @Autowired
    private ComponentLibraryService service;

    @Override
    public void run(ApplicationArguments args) {
        List<ComponentDefinition> builtIns = List.of(
            // ── TEXT ──────────────────────────────────────────────────────────
            ComponentDefinition.builder()
                .id("pageheader").kind("pageheader").label("Page Header")
                .description("Top-level header block").category("text")
                .icon("Heading1").defaultText("You made a purchase of $831.77")
                .custom(false).build(),

            ComponentDefinition.builder()
                .id("heading").kind("heading").label("Heading")
                .description("H1-level section title").category("text")
                .icon("Heading").defaultText("Hello, {{CustomerName}}")
                .custom(false).build(),

            ComponentDefinition.builder()
                .id("subheading").kind("subheading").label("Subheading")
                .description("H2 secondary heading").category("text")
                .icon("Heading2").defaultText("Your account summary")
                .custom(false).build(),

            ComponentDefinition.builder()
                .id("paragraph").kind("paragraph").label("Paragraph")
                .description("Body text block").category("text")
                .icon("AlignLeft")
                .defaultText("Your transaction on {{TransactionDate}} at {{MerchantName}} was successful.")
                .custom(false).build(),

            ComponentDefinition.builder()
                .id("richtext").kind("richtext").label("Rich Text")
                .description("Formatted HTML text editor").category("text")
                .icon("FileText").defaultText("Enter rich text content here...")
                .custom(false).build(),

            ComponentDefinition.builder()
                .id("quote").kind("quote").label("Quote")
                .description("Highlighted quote block").category("text")
                .icon("Quote").defaultText("Your satisfaction is our priority.")
                .custom(false).build(),

            // ── ACTION ────────────────────────────────────────────────────────
            ComponentDefinition.builder()
                .id("cta").kind("cta").label("CTA Button")
                .description("Primary call-to-action button").category("action")
                .icon("MousePointerClick").defaultText("Go to account")
                .defaultUrl("https://connect.secure.wellsfargo.com/account-summary")
                .custom(false).build(),

            ComponentDefinition.builder()
                .id("link").kind("link").label("Link")
                .description("Inline hyperlink").category("action")
                .icon("Link").defaultText("View Details")
                .defaultUrl("https://www.wellsfargo.com")
                .custom(false).build(),

            ComponentDefinition.builder()
                .id("quickaction").kind("quickaction").label("Quick Action")
                .description("Icon + label action button").category("action")
                .icon("Zap").defaultText("Quick Pay")
                .defaultUrl("https://connect.secure.wellsfargo.com/transfers")
                .custom(false).build(),

            // ── MEDIA ─────────────────────────────────────────────────────────
            ComponentDefinition.builder()
                .id("image").kind("image").label("Image")
                .description("Inline image block").category("media")
                .icon("Image").defaultText("Image Alt Text")
                .custom(false).build(),

            ComponentDefinition.builder()
                .id("banner").kind("banner").label("Banner")
                .description("Full-width promotional banner").category("media")
                .icon("Layers").defaultText("Your exclusive offer awaits")
                .custom(false).build(),

            ComponentDefinition.builder()
                .id("video").kind("video").label("Video")
                .description("Embedded video thumbnail").category("media")
                .icon("Play").defaultText("Watch your account tutorial")
                .defaultUrl("https://www.wellsfargo.com/video")
                .custom(false).build(),

            // ── LAYOUT ────────────────────────────────────────────────────────
            ComponentDefinition.builder()
                .id("divider").kind("divider").label("Divider")
                .description("Horizontal rule separator").category("layout")
                .icon("Minus").defaultText("")
                .custom(false).build(),

            ComponentDefinition.builder()
                .id("spacer").kind("spacer").label("Spacer")
                .description("Blank vertical spacing block").category("layout")
                .icon("Space").defaultText("")
                .custom(false).build(),

            // ── DATA ──────────────────────────────────────────────────────────
            ComponentDefinition.builder()
                .id("transactionsummary").kind("transactionsummary").label("Transaction Summary")
                .description("Structured transaction data card").category("data")
                .icon("Receipt").defaultText("Transaction details")
                .custom(false).build(),

            ComponentDefinition.builder()
                .id("accountdetails").kind("accountdetails").label("Account Details")
                .description("Account information card").category("data")
                .icon("CreditCard").defaultText("Account overview")
                .custom(false).build(),

            ComponentDefinition.builder()
                .id("keymetrics").kind("keymetrics").label("Key Metrics")
                .description("3-column metrics grid").category("data")
                .icon("BarChart3").defaultText("Performance metrics")
                .custom(false).build()
        );

        int seeded = 0;
        for (ComponentDefinition def : builtIns) {
            service.seedIfAbsent(def);
            seeded++;
        }

        System.out.println("[ComponentLibrary] Seeded " + seeded
            + " built-in component definitions into COMPONENT_LIBRARY collection.");
    }
}
