package com.itsqmet.matu_relaciones.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.itsqmet.matu_relaciones.model.Cliente;
import com.itsqmet.matu_relaciones.repository.ClienteRepository;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    private final ClienteRepository repo;

    public ClienteController(ClienteRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Cliente> all() { return repo.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<Cliente> get(@PathVariable Long id) {
        return repo.findById(id).map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public Cliente create(@RequestBody Cliente c) { return repo.save(c); }

    @PutMapping("/{id}")
    public ResponseEntity<Cliente> update(@PathVariable Long id, @RequestBody Cliente c) {
        return repo.findById(id).map(ex -> {
            ex.setNombre(c.getNombre());
            ex.setEmail(c.getEmail());
            return ResponseEntity.ok(repo.save(ex));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return repo.findById(id).map(ex -> {
            repo.delete(ex);
            return ResponseEntity.noContent().<Void>build();
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
}
