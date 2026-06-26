package com.itsqmet.matu_relaciones.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.itsqmet.matu_relaciones.model.Cliente;
import com.itsqmet.matu_relaciones.model.Pedido;
import com.itsqmet.matu_relaciones.repository.ClienteRepository;
import com.itsqmet.matu_relaciones.repository.PedidoRepository;

class PedidoRequest {
    public String fechaPedido;
    public String estado;
    public Long clienteId;
}

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    private final PedidoRepository repo;
    private final ClienteRepository clienteRepo;

    public PedidoController(PedidoRepository repo, ClienteRepository clienteRepo) {
        this.repo = repo;
        this.clienteRepo = clienteRepo;
    }

    @GetMapping
    public List<Pedido> all() { return repo.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<Pedido> get(@PathVariable Long id) {
        return repo.findById(id).map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody PedidoRequest req) {
        if (req.clienteId == null) return ResponseEntity.badRequest().body("clienteId es obligatorio");
        Cliente cliente = clienteRepo.findById(req.clienteId).orElse(null);
        if (cliente == null) return ResponseEntity.badRequest().body("Cliente no encontrado: " + req.clienteId);
        Pedido p = new Pedido();
        p.setFechaPedido(req.fechaPedido);
        p.setEstado(req.estado);
        p.setCliente(cliente);
        return ResponseEntity.ok(repo.save(p));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody PedidoRequest req) {
        return repo.findById(id).map(ex -> {
            ex.setFechaPedido(req.fechaPedido);
            ex.setEstado(req.estado);
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
