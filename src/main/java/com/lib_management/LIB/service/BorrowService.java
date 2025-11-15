package com.lib_management.LIB.service;

import com.lib_management.LIB.entity.Book;
import com.lib_management.LIB.entity.Borrow;
import com.lib_management.LIB.entity.User;
import com.lib_management.LIB.repository.BookRepository;
import com.lib_management.LIB.repository.BorrowRepository;
import com.lib_management.LIB.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class BorrowService {

    private final BorrowRepository borrowRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;

    // Corrected: Using constructor injection
    public BorrowService(BorrowRepository borrowRepository, UserRepository userRepository, BookRepository bookRepository) {
        this.borrowRepository = borrowRepository;
        this.userRepository = userRepository;
        this.bookRepository = bookRepository;
    }

    public List<Borrow> getAllBorrows() {
        return borrowRepository.findAll();
    }

   public List<Borrow> getUserBorrows(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        return borrowRepository.findByUserId(user.getId());
    }


@Transactional
public Borrow borrowBook(String username, Long bookId, int days) {
    User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
    Book book = bookRepository.findById(bookId)
            .orElseThrow(() -> new RuntimeException("Book not found"));

        if (!book.isAvailable()) {
            throw new RuntimeException("Book is not available for borrowing");
        }

        book.setAvailable(false);
        bookRepository.save(book);

        Borrow borrow = new Borrow();
        borrow.setUser(user);
        borrow.setBook(book);
        borrow.setBorrowDate(LocalDate.now());
        borrow.setDueDate(LocalDate.now().plusDays(days));
        borrow.setPenalty(0.0);

        return borrowRepository.save(borrow);
    }
    
    @Transactional
    public Borrow returnBook(Long borrowId) {
        Borrow borrow = borrowRepository.findById(borrowId).orElseThrow(() -> new RuntimeException("Borrow record not found"));
        
        if (borrow.getReturnDate() != null) {
            throw new RuntimeException("Book has already been returned");
        }
        
        borrow.setReturnDate(LocalDate.now());
        
        // Corrected: Direct use of LocalDate for calculation
        if (borrow.getReturnDate().isAfter(borrow.getDueDate())) {
            long overdueDays = ChronoUnit.DAYS.between(borrow.getDueDate(), borrow.getReturnDate());
            double penalty = overdueDays * borrow.getBook().getRentPerDay();
            borrow.setPenalty(penalty);
        }

        Book book = borrow.getBook();
        book.setAvailable(true);
        bookRepository.save(book);

        return borrowRepository.save(borrow);
    }

    public Borrow DeleteBorrow(Long borrowId) {
        Borrow borrow = borrowRepository.findById(borrowId).orElseThrow(() -> new RuntimeException("Borrow record not found"));
        Book book = borrow.getBook();
        book.setAvailable(true);
        bookRepository.save(book);
        borrowRepository.delete(borrow);
        return borrow;
    }
}