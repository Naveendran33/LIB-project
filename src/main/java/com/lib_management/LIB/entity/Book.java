package com.lib_management.LIB.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "books")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Book {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @jakarta.validation.constraints.NotBlank(message = "Title is required")
    @Column(nullable = false)
    private String title;

    @jakarta.validation.constraints.NotBlank(message = "Author is required")
    @Column(nullable = false)
    private String author;

    @jakarta.validation.constraints.NotBlank(message = "Category is required")
    @Column(nullable = false)
    private String category;

    @jakarta.validation.constraints.Min(value = 0, message = "Rent per day cannot be negative")
    private double rentPerDay;

    @Column(nullable = false)
    private boolean available;

}
