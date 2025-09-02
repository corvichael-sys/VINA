import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Debt } from "@/types/debt";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

interface DebtActionsMenuProps {
  debt: Debt;
  onEdit: (debt: Debt) => void;
  onDelete: (debt: Debt) => void;
  onToggleStatus: (debt: Debt) => void;
  isTogglingStatus: boolean;
}

export const DebtActionsMenu: React.FC<DebtActionsMenuProps> = ({
  debt,
  onEdit,
  onDelete,
  onToggleStatus,
  isTogglingStatus,
}) => {
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);

  const handleAction = (action: (debt: Debt) => void) => {
    action(debt);
    setOpen(false);
  };

  const actions = (
    <div className="flex flex-col gap-2">
      <Button
        variant="outline"
        className="w-full justify-start"
        onClick={() => handleAction(onEdit)}
      >
        Edit
      </Button>
      <Button
        variant="outline"
        className="w-full justify-start"
        onClick={() => handleAction(onToggleStatus)}
        disabled={isTogglingStatus}
      >
        {debt.status === 'paid' ? 'Mark as Active' : 'Mark as Paid'}
      </Button>
      <Button
        variant="destructive"
        className="w-full justify-start"
        onClick={() => handleAction(onDelete)}
      >
        Delete
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>Actions for {debt.name}</DrawerTitle>
          </DrawerHeader>
          <div className="p-4">{actions}</div>
          <DrawerFooter className="pt-2">
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onEdit(debt)}>Edit</DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onToggleStatus(debt)}
          disabled={isTogglingStatus}
        >
          {debt.status === 'paid' ? 'Mark as Active' : 'Mark as Paid'}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onDelete(debt)}
          className="text-destructive focus:bg-destructive/90 focus:text-destructive-foreground"
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};