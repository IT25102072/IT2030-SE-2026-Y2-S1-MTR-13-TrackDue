package com.trackdue.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Resolve path to frontend relative to working directory or project root
        File siblingFrontend = new File("../frontend");
        File localFrontend = new File("frontend");
        
        String siblingFrontendUri = siblingFrontend.exists() ? siblingFrontend.toURI().toString() : "file:../frontend/";
        String localFrontendUri = localFrontend.exists() ? localFrontend.toURI().toString() : "file:./frontend/";

        registry.addResourceHandler("/**")
                .addResourceLocations(
                        siblingFrontendUri,
                        localFrontendUri,
                        "classpath:/static/"
                );
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // Direct root and app routes to their respective pages
        registry.addViewController("/").setViewName("forward:/pages/index.html");
        registry.addViewController("/app").setViewName("forward:/pages/app.html");
        registry.addViewController("/index.html").setViewName("forward:/pages/index.html");
        registry.addViewController("/app.html").setViewName("forward:/pages/app.html");
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false);
    }
}
