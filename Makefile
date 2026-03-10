install:
	npm ci

dev:
	npm run dev

lint:
	npx eslint .

lint-fix:
	npx eslint . --fix

build:
	NODE_ENV=production npm run build

test:
	echo no tests