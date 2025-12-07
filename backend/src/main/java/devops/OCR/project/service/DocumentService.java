package devops.ocr.project.service;

import devops.ocr.project.dto.OcrResponse;
import devops.ocr.project.model.Document;
import devops.ocr.project.repository.DocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.*;
import org.springframework.beans.factory.annotation.Value;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@Service
public class DocumentService {
    
    @Autowired
    private DocumentRepository documentRepository;
    
    private final String uploadDir = "/tmp/uploads/";
    @Value("${ocr.service.url:http://ia-service:8001/ocr}")
    private String ocrServiceUrl;
    
    public Document uploadDocument(MultipartFile file) throws IOException {
        // 1. Créer le dossier si n'existe pas
        Files.createDirectories(Paths.get(uploadDir));
        
        // 2. Sauvegarder le fichier
        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path filePath = Paths.get(uploadDir + fileName);
        Files.write(filePath, file.getBytes());
        
        // 3. Créer l'entité Document
        Document document = new Document();
        document.setFileName(file.getOriginalFilename());
        document.setFilePath(filePath.toString());
        document.setFileType(file.getContentType());
        document.setStatus("PENDING");
        
        // 4. Sauvegarder dans PostgreSQL
        Document savedDoc = documentRepository.save(document);
        
        // 5. Appeler le service OCR
        processOCR(savedDoc.getId(), file.getBytes());
        
        return savedDoc;
    }
    
    private void processOCR(Long documentId, byte[] imageBytes) {
        try {
            // Mettre à jour le statut
            Document doc = documentRepository.findById(documentId).orElseThrow();
            doc.setStatus("PROCESSING");
            documentRepository.save(doc);
            
            // Convertir image en Base64
            String base64Image = Base64.getEncoder().encodeToString(imageBytes);
            
            // Préparer la requête JSON
            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("image", base64Image);
            
            // Appeler le service OCR Python
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, String>> requestEntity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<OcrResponse> response = restTemplate.exchange(
                ocrServiceUrl,
                HttpMethod.POST,
                requestEntity,
                OcrResponse.class
            );
            
            // Mettre à jour avec le texte extrait
            if (response.getStatusCode() == HttpStatus.OK && 
                response.getBody() != null && 
                "success".equals(response.getBody().getStatus())) {
                
                doc.setExtractedText(response.getBody().getText());
                doc.setStatus("COMPLETED");
            } else {
                doc.setStatus("ERROR");
            }
            
            documentRepository.save(doc);
            
        } catch (Exception e) {
            Document doc = documentRepository.findById(documentId).orElseThrow();
            doc.setStatus("ERROR");
            documentRepository.save(doc);
            e.printStackTrace();
        }
    }
    
    public List<Document> getAllDocuments() {
        return documentRepository.findAll();
    }
    
    public Document getDocument(Long id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));
    }
    
    public List<Document> getDocumentsByStatus(String status) {
        return documentRepository.findByStatus(status);
    }
}