package com.lib_management.LIB.controller;

import java.util.Collections;
import java.util.List;
import com.lib_management.LIB.entity.Book;
import com.lib_management.LIB.service.BookService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/books")
public class BookController {
    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

 @GetMapping("/{id}")
    public Book getBookById(@PathVariable Long id) {
        return bookService.getBookById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Book not found with id: " + id));
    }

    @GetMapping
    public List<Book> getAllBooks(){
        return bookService.getAllBooks();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin")
    public Book addBook(@RequestBody Book book){
        return bookService.addBook(book);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/admin/{id}")
    public Book updateBook(@PathVariable Long id, @RequestBody Book bookDetails){
        if (id == null || bookDetails == null) {
            throw new NullPointerException("Book id and details cannot be null");
        }
        return bookService.updateBook(id, bookDetails);
    }


    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/admin/{id}")
    public String deleteBook(@PathVariable Long id){
        if (id == null) {
            throw new NullPointerException("Book id cannot be null");
        }

        try {
            bookService.deleteBook(id);
            return "Book with id " + id + " deleted successfully";
        } catch (RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Book not found with id " + id, e);
        }
    }

    @GetMapping("/search/title")
public ResponseEntity<List<Book>> searchByTitle(@RequestParam(required = false) String title){
    if (title == null || title.isBlank()) {
        return ResponseEntity.badRequest().body(Collections.emptyList());
    }
    return ResponseEntity.ok(bookService.searchByTitle(title));
}

@GetMapping("/search/category")
public ResponseEntity<List<Book>> searchByCategory(@RequestParam(required = false) String category){
    if (category == null || category.isBlank()) {
        return ResponseEntity.badRequest().body(Collections.emptyList());
    }
    return ResponseEntity.ok(bookService.searchByCategory(category));
}


    @GetMapping("/available")
    public List<Book> getAvailableBooks(){
        return bookService.getAvailableBooks();
    }


}
