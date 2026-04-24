package com.example.demo.taskfile;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.task.Task;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskFileService {

    private final TaskFileRepository taskFileRepository;

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    @Transactional(readOnly = true)
    public List<TaskFile> getFilesByTask(Integer taskId) {
        return taskFileRepository.findByTask_IdOrderByCreatedAtAsc(taskId);
    }

    public TaskFile uploadFile(Task task, MultipartFile file) throws IOException {
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);

        String originalName = file.getOriginalFilename();
        String storedName   = UUID.randomUUID() + "_" + originalName;
        Path filePath = uploadPath.resolve(storedName);
        file.transferTo(filePath.toFile());

        TaskFile taskFile = TaskFile.builder()
                .task(task)
                .originalName(originalName)
                .storedName(storedName)
                .fileSize(file.getSize())
                .build();
        return taskFileRepository.save(taskFile);
    }

    public Path getFilePath(Integer fileId) {
        TaskFile tf = taskFileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("파일을 찾을 수 없습니다: " + fileId));
        return Paths.get(uploadDir).resolve(tf.getStoredName());
    }

    public TaskFile getFileInfo(Integer fileId) {
        return taskFileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("파일을 찾을 수 없습니다: " + fileId));
    }

    public void deleteFile(Integer fileId) {
        TaskFile tf = taskFileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("파일을 찾을 수 없습니다: " + fileId));
        try {
            Files.deleteIfExists(Paths.get(uploadDir).resolve(tf.getStoredName()));
        } catch (IOException ignored) {}
        taskFileRepository.delete(tf);
    }
}
