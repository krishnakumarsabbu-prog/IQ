package com.wellsfargo.alertsiq.formbuilder;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication
@EnableMongoAuditing
public class FormBuilderApplication {
    public static void main(String[] args) {
        SpringApplication.run(FormBuilderApplication.class, args);
    }
}
