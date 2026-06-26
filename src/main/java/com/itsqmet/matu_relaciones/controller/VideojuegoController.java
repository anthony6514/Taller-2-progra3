package com.itsqmet.matu_relaciones.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.itsqmet.matu_relaciones.model.Categoria;
import com.itsqmet.matu_relaciones.model.Videojuego;
import com.itsqmet.matu_relaciones.repository.CategoriaRepository;
import com.itsqmet.matu_relaciones.repository.VideojuegoRepository;

// DTO para recibir categoriaId como campo plano desde el frontend
class VideojuegoRequest {
    public String nombre;
    public String descripcion;
    public String imageUrl;
    public Long categoriaId;
}

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/videojuegos")
public class VideojuegoController {

    private final VideojuegoRepository repo;
    private final CategoriaRepository categoriaRepo;

    public VideojuegoController(VideojuegoRepository repo, CategoriaRepository categoriaRepo) {
        this.repo = repo;
        this.categoriaRepo = categoriaRepo;
    }

    @GetMapping
    public List<Videojuego> all() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Videojuego> get(@PathVariable Long id) {
        return repo.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody VideojuegoRequest req) {
        if (req.categoriaId == null) {
            return ResponseEntity.badRequest().body("categoriaId es obligatorio");
        }
        Categoria categoria = categoriaRepo.findById(req.categoriaId).orElse(null);
        if (categoria == null) {
            return ResponseEntity.badRequest().body("Categoría no encontrada con id: " + req.categoriaId);
        }
        Videojuego v = new Videojuego();
        v.setNombre(req.nombre);
        v.setDescripcion(req.descripcion);
        v.setImageUrl(req.imageUrl);
        v.setCategoria(categoria);
        return ResponseEntity.ok(repo.save(v));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody VideojuegoRequest req) {
        return repo.findById(id).map(existing -> {
            existing.setNombre(req.nombre);
            existing.setDescripcion(req.descripcion);
            existing.setImageUrl(req.imageUrl);
            if (req.categoriaId != null) {
                categoriaRepo.findById(req.categoriaId).ifPresent(existing::setCategoria);
            }
            return ResponseEntity.ok(repo.save(existing));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return repo.findById(id).map(existing -> {
            repo.delete(existing);
            return ResponseEntity.noContent().<Void>build();
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
}
