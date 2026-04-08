package com.lms.service;

public class ValidityChecker {
    // Password Validation
    public static boolean isValidPassword(String password) {
        return password.length() >= 8 && password.matches(".*[A-Z].*") && password.matches(".*[a-z].*") && password.matches(".*[0-9].*") && password.matches(".*[!@#$%^&*()].*");
    }
    // Email Validation
    public static boolean isValidEmail(String email) {
        return email.matches("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$");
    }
    // Username Validation
    public static boolean isValidUsername(String username) {
        return username.length() >= 3 && username.matches("^[a-zA-Z0-9._%+-]+$");
    }
    // Age Validation
    public static boolean isValidAge(int age) {
        return age >= 18 && age <= 100;
    }
    // Sql Injection Validation
    public static boolean isValidSqlInjection(String sql) {
        return !sql.contains("'") && !sql.contains("\"") && !sql.contains(";") && !sql.contains("/*") && !sql.contains("*/") && !sql.contains("--") && !sql.contains("/*") && !sql.contains("*/") && !sql.contains("--");
    }
    // XSS Validation
    public static boolean isValidXSS(String xss) {
        return !xss.contains("<") && !xss.contains(">") && !xss.contains("\"") && !xss.contains("'") && !xss.contains(";") && !xss.contains("/*") && !xss.contains("*/") && !xss.contains("--") && !xss.contains("/*") && !xss.contains("*/") && !xss.contains("--");
    }
    // CSRF Validation
    public static boolean isValidCSRF(String csrf) {
        return !csrf.contains("CSRF") && !csrf.contains("csrf") && !csrf.contains("CSRF") && !csrf.contains("csrf");
    }
    // Header Validation
    public static boolean isValidHeader(String header) {
        return !header.contains("Header") && !header.contains("header") && !header.contains("Header") && !header.contains("header");
    }
    // Footer Validation
    public static boolean isValidFooter(String footer) {
        return !footer.contains("Footer") && !footer.contains("footer") && !footer.contains("Footer") && !footer.contains("footer");
    }
}
