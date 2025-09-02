import { AddDebtForm } from "@/components/debts/AddDebtForm";
import { DebtList } from "@/components/debts/DebtList";

const DebtsPage = () => {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Debts</h1>
        <AddDebtForm />
      </div>
      <div className="flex flex-1 rounded-lg border-dashed shadow-sm">
        <div className="flex flex-col items-center gap-1 text-center w-full">
          <DebtList />
        </div>
      </div>
    </>
  );
};

export default DebtsPage;