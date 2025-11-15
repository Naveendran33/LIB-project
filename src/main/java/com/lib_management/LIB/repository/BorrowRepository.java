package com.lib_management.LIB.repository;

import com.lib_management.LIB.entity.Book;
import com.lib_management.LIB.entity.Borrow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BorrowRepository extends JpaRepository<Borrow, Long> {
    List<Borrow> findByUserId(Long userId);
    List<Book> findByBookId(Long bookId);
    void deleteByUserId(Long userId);

}
