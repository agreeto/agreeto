export const openDialog = (url: string) =>
  Office.context.ui.displayDialogAsync(
    url,
    {
      height: 50,
      width: 20,
      promptBeforeOpen: false,
    },
    (res) => console.log(res)
  );
