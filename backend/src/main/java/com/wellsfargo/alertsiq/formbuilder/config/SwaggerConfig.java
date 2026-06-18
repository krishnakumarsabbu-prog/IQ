package com.wellsfargo.alertsiq.formbuilder.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Alerts IQ Dynamic Form Builder API")
                        .version("1.0.0")
                        .description("REST API documentation for managing dynamic message templates, fields, sections, tabs, master lists, rollback versions, and audits.")
                        .contact(new Contact()
                                .name("Alerts IQ Platform Team")
                                .email("alerts-iq-support@wellsfargo.com")));
    }
}
