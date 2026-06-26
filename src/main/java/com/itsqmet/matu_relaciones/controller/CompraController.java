package com.itsqmet.matu_relaciones.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.itsqmet.matu_relaciones.model.Cliente;
import com.itsqmet.matu_relaciones.model.Compra;
import com.itsqmet.matu_relaciones.model.Pedido;
import com.itsqmet.matu_relaciones.model.Videojuego;
import com.itsqmet.matu_relaciones.repository.ClienteRepository;
import com.itsqmet.matu_relaciones.repository.CompraRepository;
import com.itsqmet.matu_relaciones.repository.PedidoRepository;
import com.itsqmet.matu_relaciones.repository.VideojuegoRepository;

class CompraRequest {
    public int cantidad;
    public Long clienteId;
    public Long pedidoId;
    public Long videojuegoId;
}

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/compras")
public class CompraController {

    private final CompraRepository repo;
    private final ClienteRepository clienteRepo;
    private final PedidoRepository pedidoRepo;
    private final VideojuegoRepository videojuegoRepo;

    public CompraController(CompraRepository repo, ClienteRepository clienteRepo,
                            PedidoRepository pedidoRepo, VideojuegoRepository videojuegoRepo) {
        this.repo = repo;
        this.clienteRepo = clienteRepo;
        this.pedidoRepo = pedidoRepo;
        this.videojuegoRepo = videojuegoRepo;
    }

    @GetMapping
    public List<Compra> all() { return repo.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<Compra> get(@PathVariable Long id) {
        return repo.findById(id).map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody CompraRequest req) {
        Cliente cliente = clienteRepo.findById(req.clienteId).orElse(null);
        if (cliente == null) return ResponseEntity.badRequest().body("Cliente no encontrado");
        Pedido pedido = pedidoRepo.findById(req.pedidoId).orElse(null);
        if (pedido == null) return ResponseEntity.badRequest().body("Pedido no encontrado");
        Videojuego vj = videojuegoRepo.findById(req.videojuegoId).orElse(null);
        if (vj == null) return ResponseEntity.badRequest().body("Videojuego no encontrado");

        Compra c = new Compra();
        c.setCantidad(req.cantidad);
        c.setCliente(cliente);
        c.setPedido(pedido);
        c.setVideojuego(vj);
        return ResponseEntity.ok(repo.save(c));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody CompraRequest req) {
        return repo.findById(id).map(ex -> {
            ex.setCantidad(req.cantidad);
            if (req.clienteId != null) clienteRepo.findById(req.clienteId).ifPresent(ex::setCliente);
            if (req.pedidoId != null) pedidoRepo.findById(req.pedidoId).ifPresent(ex::setPedido);
            if (req.videojuegoId != null) videojuegoRepo.findById(req.videojuegoId).ifPresent(ex::setVideojuego);
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
