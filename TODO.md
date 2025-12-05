# LLM Research App - TODO

## Issues & Bugs

### Model Creation/Editing
- [ ] Don't allow navigation to model creation page if no API key is present
- [ ] Validate if model config is supported/valid for that specific model

### Chat & Messages
- [ ] View option and JSON export should include both user and bot messages (currently only shows user messages)
- [ ] System prompt not working correctly (tested with iPhone restriction - bot ignored system instructions)
- [ ] CSV export for all chats - Arash sends example
 
### Database & Technical
- [ ] Update PocketBase types
- [ ] Add unique user ID to each browser via cookies

### File Management
- [ ] Implement file upload option
- [ ] Add files to model config

### UI/UX
- [ ] Add page titles
- [ ] Add support contact information

## Questions to Resolve

- [ ] Should users be able to see the UUID for the chat? (currently hidden - keep it like this?)

## Documentation

- [ ] Create user manual for students

## In Progress

## Done ✓  
- [x] Allow saving model work in progress before all parameters are set (prevent data loss if API key is missing)
- [x] Add warning messages if chats already exist when editing model
- [x] Fix database link (currently not working)
- [x] Add stop sequences
