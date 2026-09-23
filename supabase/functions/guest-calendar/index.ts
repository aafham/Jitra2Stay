import { createHandler, createRpcClient } from './handler.mjs';

const rpc = createRpcClient({
  url: Deno.env.get('SUPABASE_URL'),
  serviceKey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
});

Deno.serve(createHandler({ rpc }));
