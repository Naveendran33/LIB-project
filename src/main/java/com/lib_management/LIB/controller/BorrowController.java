package com.lib_management.LIB.controller;

import org.springframework.security.core.Authentication;
import com.lib_management.LIB.entity.Borrow;
import com.lib_management.LIB.service.BorrowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/borrows")
public class BorrowController {

    @Autowired
    private BorrowService borrowService;

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Borrow>> getAllBorrows() {
        return ResponseEntity.ok(borrowService.getAllBorrows());
    }

    @GetMapping("/user/my-borrows")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<Borrow>> getUserBorrows(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(borrowService.getUserBorrows(username));
    }

@PostMapping("/user/borrow")
@PreAuthorize("hasRole('USER')")
public ResponseEntity<Borrow> borrowBook(@RequestParam Long bookId, @RequestParam int days, Authentication authentication) {
    String username = authentication.getName(); // Get username from authenticated user
    return ResponseEntity.ok(borrowService.borrowBook(username, bookId, days));
}

    @PostMapping("/user/return/{borrowId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Borrow> returnBook(@PathVariable Long borrowId) {
        return ResponseEntity.ok(borrowService.returnBook(borrowId));
    }

    @DeleteMapping("/admin/{borrowId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Borrow> deleteBorrow(@PathVariable Long borrowId) {
        Borrow borrow = borrowService.DeleteBorrow(borrowId);
        if (borrow == null) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(borrow);
    }
}
