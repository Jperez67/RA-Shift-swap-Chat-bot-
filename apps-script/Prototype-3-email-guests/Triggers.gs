function onFormSubmit(e) {
  if (!e) {
    throw new Error('onFormSubmit must be triggered by an actual Google Form submission, not by clicking Run.');
  }

  const request = parseFormEvent_(e);
  const requestRowNumber = e.range.getRow();

  processSwapRequest_(request, requestRowNumber);
}