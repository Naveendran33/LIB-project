package com.lib_management.LIB.repository;

import com.lib_management.LIB.entity.Book;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface BookRepository extends JpaRepository<Book, Long> {
    List<Book> findByTitleContainingIgnoreCase(String title);
    List<Book> findByCategoryContainingIgnoreCase(String category);
    List<Book> findByAvailable(boolean b);
}
