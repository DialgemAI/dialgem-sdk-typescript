/**
 * GENERATED FILE — DO NOT EDIT.
 *
 * Source: openapi/openapi.json. Refresh with `pnpm sync:openapi`, then `pnpm gen:types`.
 *
 * Import the friendly aliases from src/types/params.ts rather than reaching in here.
 */

export interface paths {
    "/v1/agents": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Agents */
        get: operations["list_agents_v1_agents_get"];
        put?: never;
        /** Create Agent */
        post: operations["create_agent_v1_agents_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/agents/{agent_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Agent */
        get: operations["get_agent_v1_agents__agent_id__get"];
        put?: never;
        post?: never;
        /** Delete Agent */
        delete: operations["delete_agent_v1_agents__agent_id__delete"];
        options?: never;
        head?: never;
        /** Update Agent */
        patch: operations["update_agent_v1_agents__agent_id__patch"];
        trace?: never;
    };
    "/v1/agents/{agent_id}/functions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Functions */
        get: operations["list_functions_v1_agents__agent_id__functions_get"];
        put?: never;
        /** Create Function */
        post: operations["create_function_v1_agents__agent_id__functions_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/agents/{agent_id}/functions/{function_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Delete Function */
        delete: operations["delete_function_v1_agents__agent_id__functions__function_id__delete"];
        options?: never;
        head?: never;
        /** Update Function */
        patch: operations["update_function_v1_agents__agent_id__functions__function_id__patch"];
        trace?: never;
    };
    "/v1/agents/{agent_id}/functions/reorder": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Reorder Functions */
        post: operations["reorder_functions_v1_agents__agent_id__functions_reorder_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/agents/{agent_id}/knowledge": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Documents */
        get: operations["list_documents_v1_agents__agent_id__knowledge_get"];
        put?: never;
        /** Ingest Document */
        post: operations["ingest_document_v1_agents__agent_id__knowledge_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/agents/{agent_id}/knowledge/{source_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Delete Document */
        delete: operations["delete_document_v1_agents__agent_id__knowledge__source_id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/agents/{agent_id}/mcp-servers": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Servers */
        get: operations["list_servers_v1_agents__agent_id__mcp_servers_get"];
        put?: never;
        /** Create Server */
        post: operations["create_server_v1_agents__agent_id__mcp_servers_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/agents/{agent_id}/mcp-servers/{server_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Delete Server */
        delete: operations["delete_server_v1_agents__agent_id__mcp_servers__server_id__delete"];
        options?: never;
        head?: never;
        /** Update Server */
        patch: operations["update_server_v1_agents__agent_id__mcp_servers__server_id__patch"];
        trace?: never;
    };
    "/v1/agents/{agent_id}/mcp-servers/{server_id}/test": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Test Server */
        post: operations["test_server_v1_agents__agent_id__mcp_servers__server_id__test_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/calls": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Calls */
        get: operations["list_calls_v1_calls_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/calls/{call_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Call */
        get: operations["get_call_v1_calls__call_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/calls/outbound": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Create Outbound Call */
        post: operations["create_outbound_call_v1_calls_outbound_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/calls/register": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Register Call */
        post: operations["register_call_v1_calls_register_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/flow-templates": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Flow Templates */
        get: operations["list_flow_templates_v1_flow_templates_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/flow-templates/{template_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Flow Template */
        get: operations["get_flow_template_v1_flow_templates__template_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/phone-numbers": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Phone Numbers */
        get: operations["list_phone_numbers_v1_phone_numbers_get"];
        put?: never;
        /** Register Phone Number */
        post: operations["register_phone_number_v1_phone_numbers_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/phone-numbers/{number_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Release Phone Number */
        delete: operations["release_phone_number_v1_phone_numbers__number_id__delete"];
        options?: never;
        head?: never;
        /** Update Phone Number */
        patch: operations["update_phone_number_v1_phone_numbers__number_id__patch"];
        trace?: never;
    };
    "/v1/phone-numbers/{number_id}/assign": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Assign Phone Number */
        patch: operations["assign_phone_number_v1_phone_numbers__number_id__assign_patch"];
        trace?: never;
    };
    "/v1/prompt-templates": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Prompt Templates */
        get: operations["list_prompt_templates_v1_prompt_templates_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/prompt-templates/{template_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Prompt Template */
        get: operations["get_prompt_template_v1_prompt_templates__template_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/voices": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Voices */
        get: operations["list_voices_v1_voices_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /** AgentCreate */
        AgentCreate: {
            /**
             * Agent Type
             * @default llm
             * @enum {string}
             */
            agent_type?: "llm" | "multi_prompt" | "flow";
            /**
             * Ambient Sound
             * @default none
             * @enum {string}
             */
            ambient_sound?: "none" | "coffee-shop" | "call-center" | "convention-hall" | "summer-outdoor" | "mountain-outdoor" | "static-noise";
            /**
             * Ambient Sound Volume
             * @default 1
             */
            ambient_sound_volume?: number;
            /**
             * Backchannel Frequency
             * @default 0.8
             */
            backchannel_frequency?: number;
            /**
             * Begin Message Delay Ms
             * @default 0
             */
            begin_message_delay_ms?: number;
            /** Boosted Keywords */
            boosted_keywords?: string[];
            /** Data Retention Days */
            data_retention_days?: number | null;
            /** Default Dynamic Variables */
            default_dynamic_variables?: {
                [key: string]: string;
            };
            /**
             * Denoising Mode
             * @default off
             * @enum {string}
             */
            denoising_mode?: "off" | "noise-cancellation";
            /**
             * Enable Backchannel
             * @default false
             */
            enable_backchannel?: boolean;
            /**
             * Enable Transcription Formatting
             * @default false
             */
            enable_transcription_formatting?: boolean;
            /**
             * End Call After Silence Ms
             * @default 600000
             */
            end_call_after_silence_ms?: number;
            /** Fallback Llm Model */
            fallback_llm_model?: string | null;
            /** Fallback Llm Provider */
            fallback_llm_provider?: ("anthropic" | "openai") | null;
            /** Fallback Voice Id */
            fallback_voice_id?: string | null;
            /** First Message */
            first_message?: string | null;
            flow_config?: components["schemas"]["FlowConfig"] | null;
            /**
             * Interruption Sensitivity
             * @default 1
             */
            interruption_sensitivity?: number;
            /**
             * Language
             * @default en
             */
            language?: string;
            /** Llm Model */
            llm_model?: string;
            /**
             * Llm Provider
             * @enum {string}
             */
            llm_provider?: "anthropic" | "openai";
            /**
             * Max Call Duration Ms
             * @default 3600000
             */
            max_call_duration_ms?: number;
            /**
             * Max Tokens
             * @default 150
             */
            max_tokens?: number;
            /** Name */
            name: string;
            /**
             * Opt Out Call Recording
             * @default false
             */
            opt_out_call_recording?: boolean;
            /**
             * Opt Out Transcript Storage
             * @default false
             */
            opt_out_transcript_storage?: boolean;
            /**
             * Pii Redaction Enabled
             * @default false
             */
            pii_redaction_enabled?: boolean;
            /** Post Call Analysis Data */
            post_call_analysis_data?: components["schemas"]["PostCallAnalysisVariable"][];
            /**
             * Post Call Analysis Model
             * @default claude-sonnet-4-6
             */
            post_call_analysis_model?: string;
            /**
             * Reminder Message
             * @default
             */
            reminder_message?: string;
            /**
             * Reminder Trigger Ms
             * @default 10000
             */
            reminder_trigger_ms?: number;
            /**
             * Responsiveness
             * @default 1
             */
            responsiveness?: number;
            /**
             * Ring Duration Ms
             * @default 30000
             */
            ring_duration_ms?: number;
            /** Starting State */
            starting_state?: string | null;
            /** States */
            states?: components["schemas"]["PromptState"][];
            /**
             * Stt Model
             * @enum {string}
             */
            stt_model?: "whisper" | "conformer" | "deepgram";
            /**
             * System Prompt
             * @default
             */
            system_prompt?: string;
            /**
             * Temperature
             * @default 0.7
             */
            temperature?: number;
            /**
             * Tts Engine
             * @default cartesia
             */
            tts_engine?: string;
            /**
             * Voice Id
             * @default
             */
            voice_id?: string;
            /**
             * Voice Speed
             * @default 1
             */
            voice_speed?: number;
            /**
             * Voice Temperature
             * @default 0.5
             */
            voice_temperature?: number;
            /**
             * Voicemail Action
             * @default hangup
             * @enum {string}
             */
            voicemail_action?: "hangup" | "leave_message";
            /**
             * Voicemail Detection Enabled
             * @default false
             */
            voicemail_detection_enabled?: boolean;
            /**
             * Voicemail Message
             * @default
             */
            voicemail_message?: string;
            /** Webhook Events */
            webhook_events?: ("call_started" | "call_ended" | "call_analyzed")[];
            /** Webhook Signing Secret */
            webhook_signing_secret?: string | null;
            /** Webhook Url */
            webhook_url?: string | null;
        };
        /** AgenticTransferConfig */
        AgenticTransferConfig: {
            /** Action On Timeout */
            action_on_timeout?: string | null;
            transfer_agent?: components["schemas"]["TransferAgent"] | null;
            /** Transfer Timeout Ms */
            transfer_timeout_ms?: number | null;
        } & {
            [key: string]: unknown;
        };
        /** AgentSwapNode */
        AgentSwapNode: {
            /** Agent Id */
            agent_id: string;
            /** Agent Version */
            agent_version?: string | number | null;
            display_position?: components["schemas"]["DisplayPosition"] | null;
            edge?: components["schemas"]["Edge"] | null;
            global_node_setting?: components["schemas"]["GlobalNodeSetting"] | null;
            /** Id */
            id: string;
            instruction?: components["schemas"]["Instruction"] | null;
            /** Keep Current Language */
            keep_current_language?: boolean | null;
            /** Keep Current Voice */
            keep_current_voice?: boolean | null;
            /** Name */
            name?: string | null;
            /** Post Call Analysis Setting */
            post_call_analysis_setting?: ("both_agents" | "only_destination_agent") | null;
            /** Speak During Execution */
            speak_during_execution?: boolean | null;
            /**
             * Type
             * @constant
             */
            type: "agent_swap";
            /** Webhook Setting */
            webhook_setting?: ("both_agents" | "only_destination_agent" | "only_source_agent") | null;
        } & {
            [key: string]: unknown;
        };
        /** AgentUpdate */
        AgentUpdate: {
            /** Agent Type */
            agent_type?: ("llm" | "multi_prompt" | "flow") | null;
            /** Ambient Sound */
            ambient_sound?: ("none" | "coffee-shop" | "call-center" | "convention-hall" | "summer-outdoor" | "mountain-outdoor" | "static-noise") | null;
            /** Ambient Sound Volume */
            ambient_sound_volume?: number | null;
            /** Backchannel Frequency */
            backchannel_frequency?: number | null;
            /** Begin Message Delay Ms */
            begin_message_delay_ms?: number | null;
            /** Boosted Keywords */
            boosted_keywords?: string[] | null;
            /** Data Retention Days */
            data_retention_days?: number | null;
            /** Default Dynamic Variables */
            default_dynamic_variables?: {
                [key: string]: string;
            } | null;
            /** Denoising Mode */
            denoising_mode?: ("off" | "noise-cancellation") | null;
            /** Enable Backchannel */
            enable_backchannel?: boolean | null;
            /** Enable Transcription Formatting */
            enable_transcription_formatting?: boolean | null;
            /** End Call After Silence Ms */
            end_call_after_silence_ms?: number | null;
            /** Fallback Llm Model */
            fallback_llm_model?: string | null;
            /** Fallback Llm Provider */
            fallback_llm_provider?: ("anthropic" | "openai") | null;
            /** Fallback Voice Id */
            fallback_voice_id?: string | null;
            /** First Message */
            first_message?: string | null;
            flow_config?: components["schemas"]["FlowConfig"] | null;
            /** Interruption Sensitivity */
            interruption_sensitivity?: number | null;
            /** Language */
            language?: string | null;
            /** Llm Model */
            llm_model?: string | null;
            /** Llm Provider */
            llm_provider?: ("anthropic" | "openai") | null;
            /** Max Call Duration Ms */
            max_call_duration_ms?: number | null;
            /** Max Tokens */
            max_tokens?: number | null;
            /** Name */
            name?: string | null;
            /** Opt Out Call Recording */
            opt_out_call_recording?: boolean | null;
            /** Opt Out Transcript Storage */
            opt_out_transcript_storage?: boolean | null;
            /** Pii Redaction Enabled */
            pii_redaction_enabled?: boolean | null;
            /** Post Call Analysis Data */
            post_call_analysis_data?: components["schemas"]["PostCallAnalysisVariable"][] | null;
            /** Post Call Analysis Model */
            post_call_analysis_model?: string | null;
            /** Reminder Message */
            reminder_message?: string | null;
            /** Reminder Trigger Ms */
            reminder_trigger_ms?: number | null;
            /** Responsiveness */
            responsiveness?: number | null;
            /** Ring Duration Ms */
            ring_duration_ms?: number | null;
            /** Starting State */
            starting_state?: string | null;
            /** States */
            states?: components["schemas"]["PromptState"][] | null;
            /** Stt Model */
            stt_model?: ("whisper" | "conformer" | "deepgram") | null;
            /** System Prompt */
            system_prompt?: string | null;
            /** Temperature */
            temperature?: number | null;
            /** Tts Engine */
            tts_engine?: string | null;
            /** Voice Id */
            voice_id?: string | null;
            /** Voice Speed */
            voice_speed?: number | null;
            /** Voice Temperature */
            voice_temperature?: number | null;
            /** Voicemail Action */
            voicemail_action?: ("hangup" | "leave_message") | null;
            /** Voicemail Detection Enabled */
            voicemail_detection_enabled?: boolean | null;
            /** Voicemail Message */
            voicemail_message?: string | null;
            /** Webhook Events */
            webhook_events?: ("call_started" | "call_ended" | "call_analyzed")[] | null;
            /** Webhook Signing Secret */
            webhook_signing_secret?: string | null;
            /** Webhook Url */
            webhook_url?: string | null;
        };
        /** AgentWeightIn */
        AgentWeightIn: {
            /** Agent Id */
            agent_id: string;
            /**
             * Agent Version
             * @default 0
             */
            agent_version?: number;
            /**
             * Weight
             * @default 1
             */
            weight?: number;
        };
        /** BranchNode */
        BranchNode: {
            display_position?: components["schemas"]["DisplayPosition"] | null;
            /** Edges */
            edges?: components["schemas"]["Edge"][];
            else_edge?: components["schemas"]["Edge"] | null;
            /** Finetune Transition Examples */
            finetune_transition_examples?: unknown[] | null;
            global_node_setting?: components["schemas"]["GlobalNodeSetting"] | null;
            /** Id */
            id: string;
            /** Name */
            name?: string | null;
            /**
             * Type
             * @constant
             */
            type: "branch";
        } & {
            [key: string]: unknown;
        };
        /** ConversationNode */
        ConversationNode: {
            /** Allow Dtmf Interruption */
            allow_dtmf_interruption?: boolean | null;
            always_edge?: components["schemas"]["Edge"] | null;
            display_position?: components["schemas"]["DisplayPosition"] | null;
            /** Edges */
            edges?: components["schemas"]["Edge"][];
            else_edge?: components["schemas"]["Edge"] | null;
            /** Finetune Conversation Examples */
            finetune_conversation_examples?: unknown[] | null;
            /** Finetune Transition Examples */
            finetune_transition_examples?: unknown[] | null;
            global_node_setting?: components["schemas"]["GlobalNodeSetting"] | null;
            /** Id */
            id: string;
            instruction: components["schemas"]["Instruction"];
            /** Interruption Sensitivity */
            interruption_sensitivity?: number | null;
            kb_config?: components["schemas"]["KBConfig"] | null;
            /** Knowledge Base Ids */
            knowledge_base_ids?: string[] | null;
            model_choice?: components["schemas"]["ModelChoice"] | null;
            /** Name */
            name?: string | null;
            /** Reminder Max Count */
            reminder_max_count?: number | null;
            /** Reminder Trigger Ms */
            reminder_trigger_ms?: number | null;
            /** Responsiveness */
            responsiveness?: number | null;
            skip_response_edge?: components["schemas"]["Edge"] | null;
            /**
             * Type
             * @constant
             */
            type: "conversation";
            /** Voice Speed */
            voice_speed?: number | null;
        } & {
            [key: string]: unknown;
        };
        /** DialgemExtensions */
        DialgemExtensions: {
            /** Content Hash */
            content_hash?: string | null;
            /** Equation Grammar Version */
            equation_grammar_version?: number | null;
            /** Features */
            features?: string[] | null;
            /** Not Runnable */
            not_runnable?: components["schemas"]["NotRunnableEntry"][] | null;
            /** Uses Extensions */
            uses_extensions?: boolean | null;
        } & {
            [key: string]: unknown;
        };
        /** DisplayPosition */
        DisplayPosition: {
            /** X */
            x?: number | null;
            /** Y */
            y?: number | null;
        } & {
            [key: string]: unknown;
        };
        /** DocumentCreate */
        DocumentCreate: {
            /** Content */
            content: string;
            /** Filename */
            filename: string;
        };
        /** Edge */
        Edge: {
            /** Destination Node Id */
            destination_node_id: string;
            /** Id */
            id: string;
            /** Transition Condition */
            transition_condition: components["schemas"]["PromptCondition"] | components["schemas"]["EquationCondition"];
        } & {
            [key: string]: unknown;
        };
        /** EndNode */
        EndNode: {
            display_position?: components["schemas"]["DisplayPosition"] | null;
            global_node_setting?: components["schemas"]["GlobalNodeSetting"] | null;
            /** Id */
            id: string;
            instruction?: components["schemas"]["Instruction"] | null;
            /** Name */
            name?: string | null;
            /** Speak During Execution */
            speak_during_execution?: boolean | null;
            /**
             * Type
             * @constant
             */
            type: "end";
        } & {
            [key: string]: unknown;
        };
        /** Equation */
        Equation: {
            /** Left */
            left: string;
            /**
             * Operator
             * @enum {string}
             */
            operator: "==" | "!=" | ">" | ">=" | "<" | "<=" | "contains" | "not_contains" | "exists" | "not_exist";
            /** Right */
            right?: string | null;
        } & {
            [key: string]: unknown;
        };
        /** EquationCondition */
        EquationCondition: {
            /** Equations */
            equations: components["schemas"]["Equation"][];
            /**
             * Operator
             * @enum {string}
             */
            operator: "&&" | "||";
            /** Prompt */
            prompt?: string | null;
            /**
             * Type
             * @constant
             */
            type: "equation";
        } & {
            [key: string]: unknown;
        };
        /** ExtractDynamicVariablesNode */
        ExtractDynamicVariablesNode: {
            display_position?: components["schemas"]["DisplayPosition"] | null;
            /** Edges */
            edges?: components["schemas"]["Edge"][];
            else_edge?: components["schemas"]["Edge"] | null;
            /** Enable Typing Sound */
            enable_typing_sound?: boolean | null;
            global_node_setting?: components["schemas"]["GlobalNodeSetting"] | null;
            /** Id */
            id: string;
            /** Name */
            name?: string | null;
            /**
             * Type
             * @constant
             */
            type: "extract_dynamic_variables";
            /** Variables */
            variables: {
                [key: string]: unknown;
            }[];
        } & {
            [key: string]: unknown;
        };
        /** FlowConfig */
        FlowConfig: {
            /** Begin After User Silence Ms */
            begin_after_user_silence_ms?: number | null;
            begin_tag_display_position?: components["schemas"]["DisplayPosition"] | null;
            /** Components */
            components?: unknown[] | null;
            /** Conversation Flow Id */
            conversation_flow_id?: string | null;
            /** Default Dynamic Variables */
            default_dynamic_variables?: {
                [key: string]: string;
            } | null;
            dialgem_extensions?: components["schemas"]["DialgemExtensions"] | null;
            /** Flex Mode */
            flex_mode?: boolean | null;
            /** Global Prompt */
            global_prompt?: string | null;
            /** Is Published */
            is_published?: boolean | null;
            /** Is Transfer Llm */
            is_transfer_llm?: boolean | null;
            kb_config?: components["schemas"]["KBConfig"] | null;
            /** Knowledge Base Ids */
            knowledge_base_ids?: string[] | null;
            /** Last Modification Timestamp */
            last_modification_timestamp?: number | null;
            /** Mcps */
            mcps?: unknown[] | null;
            model_choice?: components["schemas"]["ModelChoice"] | null;
            /** Model Temperature */
            model_temperature?: number | null;
            /** Nodes */
            nodes?: (components["schemas"]["ConversationNode"] | components["schemas"]["SubagentNode"] | components["schemas"]["FunctionNode"] | components["schemas"]["McpNode"] | components["schemas"]["BranchNode"] | components["schemas"]["ExtractDynamicVariablesNode"] | components["schemas"]["TransferCallNode"] | components["schemas"]["PressDigitNode"] | components["schemas"]["AgentSwapNode"] | components["schemas"]["SmsNode"] | components["schemas"]["EndNode"] | components["schemas"]["OpaqueNode"])[];
            /** Notes */
            notes?: unknown[] | null;
            /** Start Node Id */
            start_node_id?: string | null;
            /** Start Speaker */
            start_speaker?: ("user" | "agent") | null;
            /** Tool Call Strict Mode */
            tool_call_strict_mode?: boolean | null;
            /** Tools */
            tools?: components["schemas"]["FlowTool"][] | null;
            /** Version */
            version?: number | null;
        } & {
            [key: string]: unknown;
        };
        /** FlowTool */
        FlowTool: {
            /** Description */
            description?: string | null;
            /** Method */
            method?: string | null;
            /** Name */
            name?: string | null;
            /** Parameters */
            parameters?: {
                [key: string]: unknown;
            } | null;
            /** Response Variables */
            response_variables?: {
                [key: string]: unknown;
            } | null;
            /** Speak After Execution */
            speak_after_execution?: boolean | null;
            /** Speak During Execution */
            speak_during_execution?: boolean | null;
            /** Timeout Ms */
            timeout_ms?: number | null;
            /** Tool Id */
            tool_id: string;
            /** Type */
            type?: string | null;
            /** Url */
            url?: string | null;
        } & {
            [key: string]: unknown;
        };
        /** FunctionCreate */
        FunctionCreate: {
            /** Config */
            config?: {
                [key: string]: unknown;
            };
            /**
             * Description
             * @default
             */
            description?: string;
            /** Headers */
            headers?: components["schemas"]["KVPair"][];
            /**
             * Kind
             * @default custom
             * @enum {string}
             */
            kind?: "custom" | "end_call" | "transfer_call" | "press_digit" | "agent_swap" | "check_availability_cal" | "book_appointment_cal";
            /**
             * Method
             * @default POST
             */
            method?: string;
            /** Name */
            name: string;
            /** Parameters */
            parameters?: {
                [key: string]: unknown;
            };
            /** Query Params */
            query_params?: components["schemas"]["KVPair"][];
            /** Response Variables */
            response_variables?: {
                [key: string]: string;
            };
            /**
             * Speak After Execution
             * @default true
             */
            speak_after_execution?: boolean;
            /** Speak During Execution */
            speak_during_execution?: string | null;
            /**
             * Timeout Ms
             * @default 10000
             */
            timeout_ms?: number;
            /**
             * Url
             * @default
             */
            url?: string;
        };
        /** FunctionDef */
        FunctionDef: {
            /** Config */
            config?: {
                [key: string]: unknown;
            };
            /**
             * Description
             * @default
             */
            description?: string;
            /** Headers */
            headers?: components["schemas"]["KVPair"][];
            /** Id */
            id?: string | null;
            /**
             * Kind
             * @default custom
             * @enum {string}
             */
            kind?: "custom" | "check_availability_cal" | "book_appointment_cal" | "end_call" | "transfer_call" | "press_digit" | "agent_swap";
            /**
             * Method
             * @default POST
             */
            method?: string;
            /** Name */
            name: string;
            /** Parameters */
            parameters?: {
                [key: string]: unknown;
            };
            /** Query Params */
            query_params?: components["schemas"]["KVPair"][];
            /**
             * Speak After Execution
             * @default true
             */
            speak_after_execution?: boolean;
            /** Speak During Execution */
            speak_during_execution?: string | null;
            /**
             * Timeout Ms
             * @default 10000
             */
            timeout_ms?: number;
            /**
             * Url
             * @default
             */
            url?: string;
        };
        /** FunctionNode */
        FunctionNode: {
            display_position?: components["schemas"]["DisplayPosition"] | null;
            /** Edges */
            edges?: components["schemas"]["Edge"][];
            else_edge?: components["schemas"]["Edge"] | null;
            /** Enable Typing Sound */
            enable_typing_sound?: boolean | null;
            global_node_setting?: components["schemas"]["GlobalNodeSetting"] | null;
            /** Id */
            id: string;
            instruction?: components["schemas"]["Instruction"] | null;
            /** Name */
            name?: string | null;
            /** Speak During Execution */
            speak_during_execution?: boolean | null;
            /** Tool Id */
            tool_id: string;
            /** Tool Type */
            tool_type?: ("local" | "shared") | null;
            /**
             * Type
             * @constant
             */
            type: "function";
            /** Wait For Result */
            wait_for_result?: boolean | null;
        } & {
            [key: string]: unknown;
        };
        /** FunctionReorder */
        FunctionReorder: {
            /** Order */
            order: string[];
        };
        /** FunctionUpdate */
        FunctionUpdate: {
            /** Config */
            config?: {
                [key: string]: unknown;
            } | null;
            /** Description */
            description?: string | null;
            /** Headers */
            headers?: components["schemas"]["KVPair"][] | null;
            /** Method */
            method?: string | null;
            /** Parameters */
            parameters?: {
                [key: string]: unknown;
            } | null;
            /** Query Params */
            query_params?: components["schemas"]["KVPair"][] | null;
            /** Response Variables */
            response_variables?: {
                [key: string]: string;
            } | null;
            /** Speak After Execution */
            speak_after_execution?: boolean | null;
            /** Speak During Execution */
            speak_during_execution?: string | null;
            /** Timeout Ms */
            timeout_ms?: number | null;
            /** Url */
            url?: string | null;
        };
        /** GlobalNodeSetting */
        GlobalNodeSetting: {
            /** Condition */
            condition: string;
            /** Cool Down */
            cool_down?: number | null;
            /** Go Back Conditions */
            go_back_conditions?: components["schemas"]["GoBackCondition"][] | null;
            /** Negative Finetune Examples */
            negative_finetune_examples?: unknown[] | null;
            /** Positive Finetune Examples */
            positive_finetune_examples?: unknown[] | null;
        } & {
            [key: string]: unknown;
        };
        /** GoBackCondition */
        GoBackCondition: {
            /** Id */
            id?: string | null;
            /** Transition Condition */
            transition_condition?: components["schemas"]["PromptCondition"] | components["schemas"]["EquationCondition"] | null;
        } & {
            [key: string]: unknown;
        };
        /** HandoffOption */
        HandoffOption: {
            /** Message */
            message?: string | null;
            /** Prompt */
            prompt?: string | null;
            /** Type */
            type?: string | null;
        } & {
            [key: string]: unknown;
        };
        /** HTTPValidationError */
        HTTPValidationError: {
            /** Detail */
            detail?: components["schemas"]["ValidationError"][];
        };
        /** Instruction */
        Instruction: {
            /** Text */
            text: string;
            /**
             * Type
             * @enum {string}
             */
            type: "prompt" | "static_text";
        } & {
            [key: string]: unknown;
        };
        /** IvrOption */
        IvrOption: {
            /** Prompt */
            prompt?: string | null;
            /** Type */
            type?: string | null;
        } & {
            [key: string]: unknown;
        };
        /** KBConfig */
        KBConfig: {
            /** Filter Score */
            filter_score?: number | null;
            /** Top K */
            top_k?: number | null;
        } & {
            [key: string]: unknown;
        };
        /** KVPair */
        KVPair: {
            /** Key */
            key: string;
            /** Value */
            value: string;
        };
        /** McpNode */
        McpNode: {
            display_position?: components["schemas"]["DisplayPosition"] | null;
            /** Edges */
            edges?: components["schemas"]["Edge"][];
            else_edge?: components["schemas"]["Edge"] | null;
            /** Enable Typing Sound */
            enable_typing_sound?: boolean | null;
            global_node_setting?: components["schemas"]["GlobalNodeSetting"] | null;
            /** Id */
            id: string;
            instruction?: components["schemas"]["Instruction"] | null;
            /** Mcp Id */
            mcp_id: string;
            /** Mcp Tool Name */
            mcp_tool_name: string;
            /** Name */
            name?: string | null;
            /** Response Variables */
            response_variables?: {
                [key: string]: string;
            } | null;
            /** Speak During Execution */
            speak_during_execution?: boolean | null;
            /**
             * Type
             * @constant
             */
            type: "mcp";
            /** Wait For Result */
            wait_for_result?: boolean | null;
        } & {
            [key: string]: unknown;
        };
        /** MCPServerCreate */
        MCPServerCreate: {
            /** Auth Token */
            auth_token?: string | null;
            /**
             * Enabled
             * @default true
             */
            enabled?: boolean;
            /** Headers */
            headers?: components["schemas"]["KVPair"][];
            /** Name */
            name: string;
            /** Query Params */
            query_params?: components["schemas"]["KVPair"][];
            /**
             * Timeout Ms
             * @default 10000
             */
            timeout_ms?: number;
            /** Url */
            url: string;
        };
        /** MCPServerUpdate */
        MCPServerUpdate: {
            /** Auth Token */
            auth_token?: string | null;
            /** Enabled */
            enabled?: boolean | null;
            /** Headers */
            headers?: components["schemas"]["KVPair"][] | null;
            /** Query Params */
            query_params?: components["schemas"]["KVPair"][] | null;
            /** Timeout Ms */
            timeout_ms?: number | null;
            /** Url */
            url?: string | null;
        };
        /** ModelChoice */
        ModelChoice: {
            /** High Priority */
            high_priority?: boolean | null;
            /** Model */
            model?: string | null;
            /** Type */
            type?: string | null;
        } & {
            [key: string]: unknown;
        };
        /** NotRunnableEntry */
        NotRunnableEntry: {
            /**
             * Message
             * @default
             */
            message?: string;
            /** Node Ids */
            node_ids?: string[];
            /** Reason */
            reason: string;
        } & {
            [key: string]: unknown;
        };
        /** OpaqueNode */
        OpaqueNode: {
            display_position?: components["schemas"]["DisplayPosition"] | null;
            global_node_setting?: components["schemas"]["GlobalNodeSetting"] | null;
            /** Id */
            id: string;
            /** Name */
            name?: string | null;
            /** Type */
            type: string;
        } & {
            [key: string]: unknown;
        };
        /** OutboundCallRequest */
        OutboundCallRequest: {
            /** Agent Id */
            agent_id?: string | null;
            /** Dialgem Llm Dynamic Variables */
            dialgem_llm_dynamic_variables?: {
                [key: string]: unknown;
            } | null;
            /** From */
            from_: string;
            /** To */
            to: string;
        };
        /** PhoneNumberAssign */
        PhoneNumberAssign: {
            /** Agent Id */
            agent_id?: string | null;
        };
        /** PhoneNumberCreate */
        PhoneNumberCreate: {
            /**
             * Custom Sms Enabled
             * @default false
             */
            custom_sms_enabled?: boolean;
            /**
             * Flow Sms Sender Enabled
             * @default false
             */
            flow_sms_sender_enabled?: boolean;
            /** Inbound Agent Id */
            inbound_agent_id?: string | null;
            /** Nickname */
            nickname?: string | null;
            /** Number */
            number?: string | null;
            /** Outbound Agent Id */
            outbound_agent_id?: string | null;
            /** Phone Number */
            phone_number?: string | null;
            /**
             * Phone Number Type
             * @default custom
             */
            phone_number_type?: string;
            /**
             * Provider
             * @default twilio
             */
            provider?: string;
            /** Provider Sid */
            provider_sid?: string | null;
            sip_outbound_trunk_config?: components["schemas"]["SipOutboundTrunkConfigIn"] | null;
        };
        /** PhoneNumberUpdate */
        PhoneNumberUpdate: {
            /** Custom Sms Enabled */
            custom_sms_enabled?: boolean | null;
            /** Flow Sms Sender Enabled */
            flow_sms_sender_enabled?: boolean | null;
            /** Inbound Agent Id */
            inbound_agent_id?: string | null;
            /** Inbound Agents */
            inbound_agents?: components["schemas"]["AgentWeightIn"][] | null;
            /** Nickname */
            nickname?: string | null;
            /** Outbound Agent Id */
            outbound_agent_id?: string | null;
            /** Outbound Agents */
            outbound_agents?: components["schemas"]["AgentWeightIn"][] | null;
            /** Phone Number Type */
            phone_number_type?: string | null;
            /**
             * Set Inbound Agent
             * @default false
             */
            set_inbound_agent?: boolean;
            /**
             * Set Outbound Agent
             * @default false
             */
            set_outbound_agent?: boolean;
            sip_outbound_trunk_config?: components["schemas"]["SipOutboundTrunkConfigIn"] | null;
        };
        /** PostCallAnalysisVariable */
        PostCallAnalysisVariable: {
            /** Choices */
            choices?: string[] | null;
            /**
             * Description
             * @default
             */
            description?: string;
            /** Name */
            name: string;
            /**
             * Type
             * @enum {string}
             */
            type: "string" | "number" | "boolean" | "enum";
        };
        /** PressDigitNode */
        PressDigitNode: {
            /** Delay Ms */
            delay_ms?: number | null;
            display_position?: components["schemas"]["DisplayPosition"] | null;
            /** Edges */
            edges?: components["schemas"]["Edge"][];
            else_edge?: components["schemas"]["Edge"] | null;
            global_node_setting?: components["schemas"]["GlobalNodeSetting"] | null;
            /** Id */
            id: string;
            instruction: components["schemas"]["Instruction"];
            /** Name */
            name?: string | null;
            /**
             * Type
             * @constant
             */
            type: "press_digit";
        } & {
            [key: string]: unknown;
        };
        /** PromptCondition */
        PromptCondition: {
            /** Prompt */
            prompt: string;
            /**
             * Type
             * @constant
             */
            type: "prompt";
        } & {
            [key: string]: unknown;
        };
        /** PromptState */
        PromptState: {
            /** Edges */
            edges?: components["schemas"]["StateEdge"][];
            /** Name */
            name: string;
            /**
             * State Prompt
             * @default
             */
            state_prompt?: string;
            /** Tools */
            tools?: components["schemas"]["FunctionDef"][];
        } & {
            [key: string]: unknown;
        };
        /** PromptTemplateDetail */
        PromptTemplateDetail: {
            /**
             * Agent Type
             * @default llm
             */
            agent_type?: string;
            /** Base */
            base?: string | null;
            /** Category */
            category: string;
            /** Default Dynamic Variables */
            default_dynamic_variables?: {
                [key: string]: string;
            };
            /** Description */
            description: string;
            /** First Message */
            first_message: string;
            /** Icon */
            icon: string;
            /** Id */
            id: string;
            /** Name */
            name: string;
            /** Setup Note */
            setup_note: string;
            /** Source */
            source: string;
            /** System Prompt */
            system_prompt: string;
            /** System Prompt Chars */
            system_prompt_chars: number;
            /** Tags */
            tags: string[];
            /** Use Case */
            use_case: string;
            /** Variable Names */
            variable_names: string[];
        };
        /** PromptTemplateSummary */
        PromptTemplateSummary: {
            /**
             * Agent Type
             * @default llm
             */
            agent_type?: string;
            /** Base */
            base?: string | null;
            /** Category */
            category: string;
            /** Description */
            description: string;
            /** Icon */
            icon: string;
            /** Id */
            id: string;
            /** Name */
            name: string;
            /** Setup Note */
            setup_note: string;
            /** Source */
            source: string;
            /** System Prompt Chars */
            system_prompt_chars: number;
            /** Tags */
            tags: string[];
            /** Use Case */
            use_case: string;
            /** Variable Names */
            variable_names: string[];
        };
        /** RegisterCallRequest */
        RegisterCallRequest: {
            /** Agent Id */
            agent_id: string;
            /** Call Sid */
            call_sid?: string | null;
            /** Dialgem Llm Dynamic Variables */
            dialgem_llm_dynamic_variables?: {
                [key: string]: unknown;
            } | null;
            /**
             * Direction
             * @default inbound
             */
            direction?: string;
            /** From Number */
            from_number?: string | null;
            /** Metadata */
            metadata?: {
                [key: string]: unknown;
            } | null;
            /** To Number */
            to_number?: string | null;
        };
        /** RegisterCallResponse */
        RegisterCallResponse: {
            /** Call Id */
            call_id: string;
            /** Expires In */
            expires_in: number;
            /** Stream Url */
            stream_url: string;
        };
        /** SipOutboundTrunkConfigIn */
        SipOutboundTrunkConfigIn: {
            /** Auth Password */
            auth_password?: string | null;
            /** Auth Username */
            auth_username?: string | null;
            /** Termination Uri */
            termination_uri?: string | null;
            /** Transport */
            transport?: string | null;
        };
        /** SmsEdge */
        SmsEdge: {
            /** Destination Node Id */
            destination_node_id?: string | null;
            /** Id */
            id?: string | null;
            /** Transition Condition */
            transition_condition?: components["schemas"]["PromptCondition"] | components["schemas"]["EquationCondition"] | null;
        } & {
            [key: string]: unknown;
        };
        /** SmsInstruction */
        SmsInstruction: {
            /** Template */
            template?: string | null;
            /** Text */
            text?: string | null;
            /** Type */
            type?: string | null;
        } & {
            [key: string]: unknown;
        };
        /** SmsNode */
        SmsNode: {
            display_position?: components["schemas"]["DisplayPosition"] | null;
            failed_edge?: components["schemas"]["SmsEdge"] | null;
            global_node_setting?: components["schemas"]["GlobalNodeSetting"] | null;
            /** Id */
            id: string;
            instruction?: components["schemas"]["SmsInstruction"] | null;
            model_choice?: components["schemas"]["ModelChoice"] | null;
            /** Name */
            name?: string | null;
            success_edge?: components["schemas"]["SmsEdge"] | null;
            /**
             * Type
             * @constant
             */
            type: "sms";
        } & {
            [key: string]: unknown;
        };
        /** StateEdge */
        StateEdge: {
            /**
             * Description
             * @default
             */
            description?: string;
            /** Destination State Name */
            destination_state_name: string;
            /** Parameters */
            parameters?: {
                [key: string]: unknown;
            } | null;
        } & {
            [key: string]: unknown;
        };
        /** SubagentNode */
        SubagentNode: {
            always_edge?: components["schemas"]["Edge"] | null;
            display_position?: components["schemas"]["DisplayPosition"] | null;
            /** Edges */
            edges?: components["schemas"]["Edge"][];
            else_edge?: components["schemas"]["Edge"] | null;
            global_node_setting?: components["schemas"]["GlobalNodeSetting"] | null;
            /** Id */
            id: string;
            instruction: components["schemas"]["Instruction"];
            kb_config?: components["schemas"]["KBConfig"] | null;
            /** Knowledge Base Ids */
            knowledge_base_ids?: string[] | null;
            model_choice?: components["schemas"]["ModelChoice"] | null;
            /** Name */
            name?: string | null;
            skip_response_edge?: components["schemas"]["Edge"] | null;
            /** Tool Ids */
            tool_ids?: string[] | null;
            /** Tools */
            tools?: unknown[] | null;
            /**
             * Type
             * @constant
             */
            type: "subagent";
        } & {
            [key: string]: unknown;
        };
        /** TransferAgent */
        TransferAgent: {
            /** Agent Id */
            agent_id?: string | null;
            /** Agent Version */
            agent_version?: string | number | null;
        } & {
            [key: string]: unknown;
        };
        /** TransferCallNode */
        TransferCallNode: {
            /** Custom Sip Headers */
            custom_sip_headers?: {
                [key: string]: unknown;
            } | null;
            display_position?: components["schemas"]["DisplayPosition"] | null;
            edge?: components["schemas"]["Edge"] | null;
            global_node_setting?: components["schemas"]["GlobalNodeSetting"] | null;
            /** Id */
            id: string;
            /** Ignore E164 Validation */
            ignore_e164_validation?: boolean | null;
            instruction?: components["schemas"]["Instruction"] | null;
            /** Name */
            name?: string | null;
            /** Speak During Execution */
            speak_during_execution?: boolean | null;
            transfer_destination: components["schemas"]["TransferDestination"];
            transfer_option: components["schemas"]["TransferOption"];
            /**
             * Type
             * @constant
             */
            type: "transfer_call";
        } & {
            [key: string]: unknown;
        };
        /** TransferDestination */
        TransferDestination: {
            /** Extension */
            extension?: string | null;
            /** Number */
            number?: string | null;
            /** Prompt */
            prompt?: string | null;
            /** Type */
            type?: ("predefined" | "inferred") | null;
        } & {
            [key: string]: unknown;
        };
        /** TransferOption */
        TransferOption: {
            /** Agent Detection Timeout Ms */
            agent_detection_timeout_ms?: number | null;
            agentic_transfer_config?: components["schemas"]["AgenticTransferConfig"] | null;
            /** Cold Transfer Mode */
            cold_transfer_mode?: string | null;
            /** Custom On Hold Music Asset Id */
            custom_on_hold_music_asset_id?: string | null;
            /** Enable Bridge Audio Cue */
            enable_bridge_audio_cue?: boolean | null;
            ivr_option?: components["schemas"]["IvrOption"] | null;
            /** On Hold Music */
            on_hold_music?: string | null;
            /** Opt Out Human Detection */
            opt_out_human_detection?: boolean | null;
            private_handoff_option?: components["schemas"]["HandoffOption"] | null;
            public_handoff_option?: components["schemas"]["HandoffOption"] | null;
            /** Show Transferee As Caller */
            show_transferee_as_caller?: boolean | null;
            /** Transfer Ring Duration Ms */
            transfer_ring_duration_ms?: number | null;
            /** Type */
            type?: ("cold_transfer" | "warm_transfer" | "agentic_warm_transfer") | null;
        } & {
            [key: string]: unknown;
        };
        /** ValidationError */
        ValidationError: {
            /** Context */
            ctx?: Record<string, never>;
            /** Input */
            input?: unknown;
            /** Location */
            loc: (string | number)[];
            /** Message */
            msg: string;
            /** Error Type */
            type: string;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    list_agents_v1_agents_get: {
        parameters: {
            query?: {
                api_key?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    }[];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_agent_v1_agents_post: {
        parameters: {
            query?: {
                api_key?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AgentCreate"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_agent_v1_agents__agent_id__get: {
        parameters: {
            query?: {
                api_key?: string | null;
            };
            header?: never;
            path: {
                agent_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_agent_v1_agents__agent_id__delete: {
        parameters: {
            query?: {
                api_key?: string | null;
            };
            header?: never;
            path: {
                agent_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_agent_v1_agents__agent_id__patch: {
        parameters: {
            query?: {
                api_key?: string | null;
            };
            header?: never;
            path: {
                agent_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AgentUpdate"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_functions_v1_agents__agent_id__functions_get: {
        parameters: {
            query?: {
                api_key?: string | null;
            };
            header?: never;
            path: {
                agent_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    }[];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_function_v1_agents__agent_id__functions_post: {
        parameters: {
            query?: {
                api_key?: string | null;
            };
            header?: never;
            path: {
                agent_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["FunctionCreate"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_function_v1_agents__agent_id__functions__function_id__delete: {
        parameters: {
            query?: {
                api_key?: string | null;
            };
            header?: never;
            path: {
                agent_id: string;
                function_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_function_v1_agents__agent_id__functions__function_id__patch: {
        parameters: {
            query?: {
                api_key?: string | null;
            };
            header?: never;
            path: {
                agent_id: string;
                function_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["FunctionUpdate"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    reorder_functions_v1_agents__agent_id__functions_reorder_post: {
        parameters: {
            query?: {
                api_key?: string | null;
            };
            header?: never;
            path: {
                agent_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["FunctionReorder"];
            };
        };
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_documents_v1_agents__agent_id__knowledge_get: {
        parameters: {
            query?: {
                api_key?: string | null;
            };
            header?: never;
            path: {
                agent_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    }[];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    ingest_document_v1_agents__agent_id__knowledge_post: {
        parameters: {
            query?: {
                api_key?: string | null;
            };
            header?: never;
            path: {
                agent_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DocumentCreate"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_document_v1_agents__agent_id__knowledge__source_id__delete: {
        parameters: {
            query?: {
                api_key?: string | null;
            };
            header?: never;
            path: {
                agent_id: string;
                source_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_servers_v1_agents__agent_id__mcp_servers_get: {
        parameters: {
            query?: {
                api_key?: string | null;
            };
            header?: never;
            path: {
                agent_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    }[];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_server_v1_agents__agent_id__mcp_servers_post: {
        parameters: {
            query?: {
                api_key?: string | null;
            };
            header?: never;
            path: {
                agent_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MCPServerCreate"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_server_v1_agents__agent_id__mcp_servers__server_id__delete: {
        parameters: {
            query?: {
                api_key?: string | null;
            };
            header?: never;
            path: {
                agent_id: string;
                server_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_server_v1_agents__agent_id__mcp_servers__server_id__patch: {
        parameters: {
            query?: {
                api_key?: string | null;
            };
            header?: never;
            path: {
                agent_id: string;
                server_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MCPServerUpdate"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    test_server_v1_agents__agent_id__mcp_servers__server_id__test_post: {
        parameters: {
            query?: {
                api_key?: string | null;
            };
            header?: never;
            path: {
                agent_id: string;
                server_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_calls_v1_calls_get: {
        parameters: {
            query?: {
                api_key?: string | null;
                date_from?: string | null;
                date_to?: string | null;
                page?: number;
                page_size?: number;
                search?: string | null;
                status?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_call_v1_calls__call_id__get: {
        parameters: {
            query?: {
                api_key?: string | null;
            };
            header?: never;
            path: {
                call_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_outbound_call_v1_calls_outbound_post: {
        parameters: {
            query?: {
                api_key?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["OutboundCallRequest"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    register_call_v1_calls_register_post: {
        parameters: {
            query?: {
                api_key?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RegisterCallRequest"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RegisterCallResponse"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_flow_templates_v1_flow_templates_get: {
        parameters: {
            query?: {
                api_key?: string | null;
                category?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    }[];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_flow_template_v1_flow_templates__template_id__get: {
        parameters: {
            query?: {
                api_key?: string | null;
            };
            header?: never;
            path: {
                template_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_phone_numbers_v1_phone_numbers_get: {
        parameters: {
            query?: {
                api_key?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown[];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    register_phone_number_v1_phone_numbers_post: {
        parameters: {
            query?: {
                api_key?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PhoneNumberCreate"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    release_phone_number_v1_phone_numbers__number_id__delete: {
        parameters: {
            query?: {
                api_key?: string | null;
            };
            header?: never;
            path: {
                number_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_phone_number_v1_phone_numbers__number_id__patch: {
        parameters: {
            query?: {
                api_key?: string | null;
            };
            header?: never;
            path: {
                number_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PhoneNumberUpdate"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    assign_phone_number_v1_phone_numbers__number_id__assign_patch: {
        parameters: {
            query?: {
                api_key?: string | null;
            };
            header?: never;
            path: {
                number_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PhoneNumberAssign"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_prompt_templates_v1_prompt_templates_get: {
        parameters: {
            query?: {
                api_key?: string | null;
                category?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PromptTemplateSummary"][];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_prompt_template_v1_prompt_templates__template_id__get: {
        parameters: {
            query?: {
                api_key?: string | null;
            };
            header?: never;
            path: {
                template_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PromptTemplateDetail"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_voices_v1_voices_get: {
        parameters: {
            query?: {
                accent?: string | null;
                api_key?: string | null;
                gender?: string | null;
                language?: string | null;
                provider?: string | null;
                search?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    }[];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
}
