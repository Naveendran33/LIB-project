package com.lib_management.LIB.service;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

import com.lib_management.LIB.entity.Book;
import com.lib_management.LIB.repository.BookRepository;


@Service
public class BookService {
    private final BookRepository bookRepository;

    public BookService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    public List<Book> getAllBooks(){
        return bookRepository.findAll();
    }

 
    @SuppressWarnings("null")
    public Book addBook(Book book){
        return bookRepository.save(book);
    }

    public Book updateBook(Long id, Book bookDetails){
        @SuppressWarnings("null")
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found with id " + id));

        book.setTitle(bookDetails.getTitle());
        book.setAuthor(bookDetails.getAuthor());
        book.setCategory(bookDetails.getCategory());
        book.setRentPerDay(bookDetails.getRentPerDay());
        book.setAvailable(bookDetails.isAvailable());

        return bookRepository.save(book);
    }

    @SuppressWarnings("null")
    public void deleteBook(Long id){
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found with id " + id));
        bookRepository.delete(book);
    }

    public List<Book> searchByTitle(String title){
        return bookRepository.findByTitleContainingIgnoreCase(title);
    }

    public List<Book> searchByCategory(String category){
        return bookRepository.findByCategoryContainingIgnoreCase(category);
    }

    public List<Book> getAvailableBooks(){
        return bookRepository.findByAvailable(true);
    }

     @SuppressWarnings("null")
    public Optional<Book> getBookById(Long id) {
        return bookRepository.findById(id);
    }
}
