-- Drop existing check constraint if it exists
ALTER TABLE analytics_events 
DROP CONSTRAINT IF EXISTS analytics_events_event_type_check;

-- Add updated check constraint with all event types
ALTER TABLE analytics_events 
ADD CONSTRAINT analytics_events_event_type_check 
CHECK (event_type IN (
  'video_view',
  'video_complete', 
  'hotspot_impression',
  'hotspot_click',
  'product_panel_open',
  'product_panel_close',
  'checkout_attempt',
  'mock_checkout_attempt',
  'product_save',
  'auth_prompt_shown',
  'auth_complete',
  'purchase_complete',
  'waitlist_signup'
));