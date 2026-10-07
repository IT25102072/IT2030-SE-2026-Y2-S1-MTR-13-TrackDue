package com.trackdue;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class TrackDueApplication {

    public static void main(String[] args) {
        SpringApplication.run(TrackDueApplication.class, args);
    }
}
