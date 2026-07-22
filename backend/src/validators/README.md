# Validators Directory

This directory is reserved for input request validation schemas (e.g., using **Zod** or other schema libraries). 

## Usage
When business routes and logic are introduced in later phases, validation schemas will be stored here to validate incoming request bodies, queries, and parameters before they hit the controller.

Example:
- `userValidator.ts` containing the user registration/login schema.
