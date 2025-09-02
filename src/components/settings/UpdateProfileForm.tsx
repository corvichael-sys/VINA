import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSession } from "@/context/SessionContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

const profileFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long.").max(50, "Username cannot be longer than 50 characters."),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export const UpdateProfileForm = () => {
  const { profile, user } = useSession();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({ username: profile.username });
    }
  }, [profile, form]);

  const updateProfileMutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      if (!user) throw new Error("User not authenticated");
      const { error } = await supabase
        .from("users_profile")
        .update({ username: values.username, updated_at: new Date().toISOString() })
        .eq("id", user.id);
      if (error) throw error;
      return values;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
      toast({
        title: "Profile updated!",
        description: `Your username has been changed to ${data.username}.`,
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error updating profile",
        description: error.message,
      });
    },
  });

  const onSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Update your personal information here.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Your username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={updateProfileMutation.isPending}>
              {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};