package com.lib_management.LIB.config;

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
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @SuppressWarnings("null")
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        String token = null;
        String username = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
            // Extract username safely — handle token parsing exceptions explicitly
            try {
                username = jwtUtil.extractUsername(token);
            } catch (ExpiredJwtException e) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Token has expired\"}");
                return;
            } catch (JwtException e) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Invalid token\"}");
                return;
            } catch (Exception e) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"" + e.getMessage() + "\"}");
                return;
            }
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                if (!jwtUtil.validateToken(token)) {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\":\"Invalid token\"}");
                    return;
                }
                String role = jwtUtil.extractRole(token);
                var authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role));
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(username, null, authorities);
                SecurityContextHolder.getContext().setAuthentication(authToken);
            } catch (ExpiredJwtException e) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Token has expired\"}");
                return;
            } catch (JwtException e) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Invalid token\"}");
                return;
            } catch (Exception e) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"" + e.getMessage() + "\"}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
