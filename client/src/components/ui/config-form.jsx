import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ConfigForm({ label }) {
  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle className="text-center text-xl">Add {label}</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <Label className="text-sm">{label}</Label>
            <Input placeholder={`Enter ${label.toLowerCase()}`} />
          </div>
          <div>
            <Label className="text-sm">Code</Label>
            <Input placeholder="Enter code" />
          </div>
          <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white mt-4">ADD</Button>
        </div>
      </CardContent>
    </Card>
  );
}
