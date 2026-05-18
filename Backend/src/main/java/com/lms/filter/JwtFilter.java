package com.lms.filter;

import com.lms.utils.JwtUtil;
import com.lms.service.UserService;
import com.lms.model.User;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserService userService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        String token = null;
        String username = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
            try {
                username = jwtUtil.extractUsername(token);
            } catch (Exception e) {
                // Malformed or expired token — let the request proceed without auth.
                // Spring Security will reject it at the authorization step if needed.
                filterChain.doFilter(request, response);
                return;
            }
        }

        if (username != null &&
            SecurityContextHolder.getContext().getAuthentication() == null) {

            // Validate token FIRST before hitting the database
            if (!jwtUtil.validateToken(token, username)) {
                filterChain.doFilter(request, response);
                return;
            }

            User user = userService.getUserByUsername(username);

            if (user != null) {
                List<SimpleGrantedAuthority> authorities =
                        user.getRoles() == null
                                ? List.of()
                                : user.getRoles()
                                        .stream()
                                        .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                                        .toList();

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                username,
                                null,
                                authorities
                        );

                SecurityContextHolder.getContext()
                        .setAuthentication(authentication);
            }
        }
        filterChain.doFilter(request, response);
    }
}