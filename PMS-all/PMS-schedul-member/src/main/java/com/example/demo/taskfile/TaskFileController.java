package com.example.demo.taskfile;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.task.Task;
import com.example.demo.task.TaskService;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.List;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class TaskFileController {

    private final TaskFileService taskFileService;
    private final TaskService taskService;

    /** 태스크에 첨부된 파일 목록 */
    @GetMapping("/task/{taskId}")
    public List<TaskFile> getFiles(@PathVariable Integer taskId) {
        return taskFileService.getFilesByTask(taskId);
    }

    /** 파일 업로드 */
    @PostMapping("/upload")
    public TaskFile uploadFile(
            @RequestParam Integer taskId,
            @RequestParam MultipartFile file) throws IOException {
        Task task = taskService.getTaskById(taskId);
        return taskFileService.uploadFile(task, file);
    }

    /** 파일 다운로드 */
    @GetMapping("/download/{fileId}")
    public ResponseEntity<Resource> downloadFile(@PathVariable Integer fileId) {
        try {
            TaskFile info = taskFileService.getFileInfo(fileId);
            Path filePath = taskFileService.getFilePath(fileId);
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists()) return ResponseEntity.notFound().build();

            String encodedName = new String(info.getOriginalName().getBytes(StandardCharsets.UTF_8), StandardCharsets.ISO_8859_1);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + encodedName + "\"")
                    .body(resource);
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /** 파일 삭제 */
    @DeleteMapping("/{fileId}")
    public ResponseEntity<Void> deleteFile(@PathVariable Integer fileId) {
        taskFileService.deleteFile(fileId);
        return ResponseEntity.noContent().build();
    }
}
