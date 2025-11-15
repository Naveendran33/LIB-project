package com.lib_management.LIB.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Borrow {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "book_id")
    private Book book;

    @Temporal(TemporalType.DATE)
    private LocalDate borrowDate;

    @Temporal(TemporalType.DATE)
    private LocalDate dueDate;

    @Temporal(TemporalType.DATE)
    private LocalDate returnDate;

    private double penalty;
}