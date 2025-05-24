
"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button"; // Import Button for the action

interface SaveWarningDialogProps {
  isOpen: boolean;
  onDismiss: () => void;
}

export function SaveWarningDialog({ isOpen, onDismiss }: SaveWarningDialogProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onDismiss()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Aviso Importante sobre o Salvamento</AlertDialogTitle>
          <AlertDialogDescription>
            Atualmente, os projetos criados no OpenBuild não são salvos automaticamente
            nos servidores do PageForge.
            <br /><br />
            Para salvar seu progresso e continuar depois, você precisa usar a opção 
            <strong>&quot;Baixar Projeto&quot;</strong>. Para carregar um projeto salvo anteriormente,
            use a opção <strong>&quot;Carregar Projeto&quot;</strong>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction asChild>
            <Button onClick={onDismiss}>Ok, entendi</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

    