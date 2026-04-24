package com.example.demo.comment;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.task.Task;
import com.example.demo.task.TaskService;
import com.example.demo.user.User;
import com.example.demo.user.UserService;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;
    private final TaskService taskService;
    private final UserService userService;

    /** 태스크의 댓글 목록 */
    @GetMapping("/task/{taskId}")
    public List<Comment> getComments(@PathVariable Integer taskId) {
        return commentService.getCommentsByTask(taskId);
    }

    /** 댓글 추가 */
    @PostMapping
    public Comment addComment(
            @RequestParam Integer taskId,
            @RequestParam Integer userId,
            @RequestParam String content) {
        Task task = taskService.getTaskById(taskId);
        User user = userService.getUserById(userId);
        return commentService.addComment(task, user, content);
    }

    /** 댓글 삭제 */
    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Integer commentId) {
        commentService.deleteComment(commentId);
        return ResponseEntity.noContent().build();
    }
}
