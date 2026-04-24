package com.example.demo.comment;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.task.Task;
import com.example.demo.user.User;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CommentService {

    private final CommentRepository commentRepository;

    @Transactional(readOnly = true)
    public List<Comment> getCommentsByTask(Integer taskId) {
        return commentRepository.findByTask_IdOrderByCreatedAtAsc(taskId);
    }

    public Comment addComment(Task task, User user, String content) {
        Comment comment = Comment.builder()
                .task(task)
                .user(user)
                .content(content)
                .build();
        return commentRepository.save(comment);
    }

    public void deleteComment(Integer commentId) {
        commentRepository.deleteById(commentId);
    }
}
