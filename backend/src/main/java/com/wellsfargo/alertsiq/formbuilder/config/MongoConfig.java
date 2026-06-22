package com.wellsfargo.alertsiq.formbuilder.config;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.MongoCredential;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.wellsfargo.alertsiq.formbuilder.service.EncryptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;
import org.springframework.data.mongodb.core.MongoTemplate;

import java.util.concurrent.TimeUnit;

@Configuration
public class MongoConfig extends AbstractMongoClientConfiguration {

    @Value("${mongoDBUri:}")
    private String mongoDBUri;

    @Value("${mongoDBConnectionAddress}")
    private String connectionAddresses;

    @Value("${mongoDBDataBase}")
    private String databaseName;

    @Value("${mongoDBUserName}")
    private String username;

    @Value("${mongoDBPassword.encrypted}")
    private String encryptedPassword;

    @Value("${mongoDBSocketConnectionTimeout:10000}")
    private int connectionTimeout;

    @Value("${mongoDBSocketReadTimeout:10000}")
    private int readTimeout;

    @Value("${mongoDBMaxConnection:10000}")
    private int maxConnection;

    @Value("${mongoDBMinConnection:10}")
    private int minConnection;

    @Value("${mongoDBReplicaSet:}")
    private String replicaSet;

    @Autowired
    private EncryptionService encryptionService;

    @Override
    protected String getDatabaseName() {
        if (mongoDBUri != null && !mongoDBUri.trim().isEmpty()) {
            try {
                ConnectionString connectionString = new ConnectionString(mongoDBUri);
                if (connectionString.getDatabase() != null) {
                    return connectionString.getDatabase();
                }
            } catch (Exception ignored) {}
        }
        return databaseName;
    }

    @Override
    @Bean
    public MongoClient mongoClient() {
        if (mongoDBUri != null && !mongoDBUri.trim().isEmpty()) {
            try {
                System.out.println("Connecting to MongoDB Atlas using URI...");
                ConnectionString connectionString = new ConnectionString(mongoDBUri);
                MongoClientSettings settings = MongoClientSettings.builder()
                        .applyConnectionString(connectionString)
                        .build();
                return MongoClients.create(settings);
            } catch (Exception e) {
                System.err.println("Atlas MongoDB connection failed: " + e.getMessage());
            }
        }

        try {
            // Decrypt the password
            String decryptedPassword = encryptionService.decryptPassword(encryptedPassword);

            // Construct connection string for Wells Fargo cluster
            // e.g. mongodb://user:pass@host1:port,host2:port,host3:port/db?replicaSet=rs_ddev2
            StringBuilder uriBuilder = new StringBuilder("mongodb://");
            uriBuilder.append(username).append(":").append(decryptedPassword).append("@").append(connectionAddresses);
            uriBuilder.append("/").append(databaseName);
            if (replicaSet != null && !replicaSet.isEmpty()) {
                uriBuilder.append("?replicaSet=").append(replicaSet);
            }

            ConnectionString connectionString = new ConnectionString(uriBuilder.toString());
            
            MongoClientSettings settings = MongoClientSettings.builder()
                    .applyConnectionString(connectionString)
                    .applyToSocketSettings(builder -> builder
                            .connectTimeout(connectionTimeout, TimeUnit.MILLISECONDS)
                            .readTimeout(readTimeout, TimeUnit.MILLISECONDS))
                    .applyToConnectionPoolSettings(builder -> builder
                            .maxSize(maxConnection)
                            .minSize(minConnection))
                    .build();

            System.out.println("Configuring Wells Fargo MongoDB Connection client settings successfully...");
            return MongoClients.create(settings);
        } catch (Exception e) {
            System.err.println("Wells Fargo MongoDB connection configuration failed. Falling back to local MongoDB: " + e.getMessage());
            // Fallback for local development if Wells Fargo network is unreachable
            return MongoClients.create("mongodb://localhost:27017/" + databaseName);
        }
    }

    @Bean
    public MongoTemplate mongoTemplate() {
        return new MongoTemplate(mongoClient(), getDatabaseName());
    }
}
