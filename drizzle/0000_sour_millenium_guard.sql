CREATE TABLE `categorias` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text NOT NULL,
	`color` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categorias_nombre_unique` ON `categorias` (`nombre`);--> statement-breakpoint
CREATE TABLE `contactos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text NOT NULL,
	`url` text
);
--> statement-breakpoint
CREATE TABLE `inspiraciones` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`proyecto_id` integer NOT NULL,
	`url_origen` text NOT NULL,
	`tipo_referencia` text NOT NULL,
	`notas` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "tipo_referencia_check" CHECK("inspiraciones"."tipo_referencia" IN ('diseno_ui', 'stack_tecnologico', 'funcionalidad', 'otro'))
);
--> statement-breakpoint
CREATE INDEX `inspiraciones_proyecto_id_idx` ON `inspiraciones` (`proyecto_id`);--> statement-breakpoint
CREATE TABLE `proyecto_contactos` (
	`proyecto_id` integer NOT NULL,
	`contacto_id` integer NOT NULL,
	PRIMARY KEY(`proyecto_id`, `contacto_id`),
	FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`contacto_id`) REFERENCES `contactos`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `proyectos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`titulo` text NOT NULL,
	`estado` text NOT NULL,
	`categoria_id` integer NOT NULL,
	`tiempo_estimado_h` real NOT NULL,
	`tiempo_invertido_h` real DEFAULT 0 NOT NULL,
	`frecuencia_avance` text NOT NULL,
	`monto_pago` real,
	`carpeta_drive_url` text,
	`repositorio_gh_url` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`categoria_id`) REFERENCES `categorias`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "estado_check" CHECK("proyectos"."estado" IN ('idea', 'en_desarrollo', 'pausado', 'finalizado')),
	CONSTRAINT "frecuencia_avance_check" CHECK("proyectos"."frecuencia_avance" IN ('diario', 'semanal', 'ocasional')),
	CONSTRAINT "tiempo_estimado_h_check" CHECK("proyectos"."tiempo_estimado_h" >= 0),
	CONSTRAINT "tiempo_invertido_h_check" CHECK("proyectos"."tiempo_invertido_h" >= 0)
);
--> statement-breakpoint
CREATE INDEX `proyectos_categoria_id_idx` ON `proyectos` (`categoria_id`);--> statement-breakpoint
CREATE INDEX `proyectos_estado_idx` ON `proyectos` (`estado`);