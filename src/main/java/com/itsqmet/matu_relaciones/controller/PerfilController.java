package com.itsqmet.matu_relaciones.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.itsqmet.matu_relaciones.model.Cliente;
import com.itsqmet.matu_relaciones.model.Perfil;
import com.itsqmet.matu_relaciones.repository.ClienteRepository;
import com.itsqmet.matu_relaciones.repository.PerfilRepository;

class PerfilRequest {
    public String usuario;
    public String descripcion;
    public Long clienteId;
}

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/perfiles")
public class PerfilController {

    private final PerfilRepository repo;
    private final ClienteRepository clienteRepo;

    public PerfilController(PerfilRepository repo, ClienteRepository clienteRepo) {
        this.repo = repo;
        this.clienteRepo = clienteRepo;
    }

    @GetMapping
    public List<Perfil> all() { return repo.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<Perfil> get(@PathVariable Long id) {
        return repo.findById(id).map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody PerfilRequest req) {
        if (req.clienteId == null) return ResponseEntity.badRequest().body("clienteId es obligatorio");
        Cliente cliente = clienteRepo.findById(req.clienteId).orElse(null);
        if (cliente == null) return ResponseEntity.badRequest().body("Cliente no encontrado: " + req.clienteId);
        Perfil p = new Perfil();
        p.setUsuario(req.usuario);
        p.setDescripcion(req.descripcion);
        p.setCliente(cliente);
        return ResponseEntity.ok(repo.save(p));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody PerfilRequest req) {
        return repo.findById(id).map(ex -> {
            ex.setUsuario(req.usuario);
            ex.setDescripcion(req.descripcion);
            if (req.clienteId != null) {
                clienteRepo.findById(req.clienteId).ifPresent(ex::setCliente);
            }
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
