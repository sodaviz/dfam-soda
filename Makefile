.PHONY: build
build: 
	@echo "Building dfam-soda..."
	@cd src && npx tsc --build tsconfig-src.json

.PHONY: builde
builde: build 
	@echo "Building dfam-soda example..."
	@cd example && make build
	
