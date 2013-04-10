///<reference path='References.ts' />

module TypeScript {
    export enum DiagnosticCode {
        error_TS_0__1,
        warning_TS_0__1,

        // Syntactic diagnostics.
        Unrecognized_escape_sequence,
        Unexpected_character_0,
        Missing_closing_quote_character,
        Identifier_expected,
        _0_keyword_expected,
        _0_expected,
        Identifier_expected__0_is_a_keyword,
        Automatic_semicolon_insertion_not_allowed,
        Unexpected_token__0_expected,
        Trailing_separator_not_allowed,
        _StarSlash__expected,
        _public_or_private_modifier_must_precede__static_,
        Unexpected_token_,
        A_catch_clause_variable_cannot_have_a_type_annotation,
        Rest_parameter_must_be_last_in_list,
        Parameter_cannot_have_question_mark_and_initializer,
        Required_parameter_cannot_follow_optional_parameter,
        Index_signatures_cannot_have_rest_parameters,
        Index_signature_parameter_cannot_have_accessibility_modifierss,
        Index_signature_parameter_cannot_have_a_question_mark,
        Index_signature_parameter_cannot_have_an_initializer,
        Index_signature_must_have_a_type_annotation,
        Index_signature_parameter_must_have_a_type_annotation,
        Index_signature_parameter_type_must_be__string__or__number_,
        _extends__clause_already_seen,
        _extends__clause_must_precede__implements__clause,
        Class_can_only_extend_single_type,
        _implements__clause_already_seen,
        Accessibility_modifier_already_seen,
        _0__modifier_must_precede__1__modifier,
        _0__modifier_already_seen,
        _0__modifier_cannot_appear_on_a_class_element,
        Interface_declaration_cannot_have__implements__clause,
        Enum_element_must_have_initializer,
        _super__invocation_cannot_have_type_arguments,
        Non_ambient_modules_cannot_use_quoted_names,
        Statements_are_not_allowed_in_ambient_contexts,
        Implementations_are_not_allowed_in_ambient_contexts,
        _declare__modifier_not_allowed_for_code_already_in_an_ambient_context,
        Initializers_are_not_allowed_in_ambient_contexts,
        Overload_and_ambient_signatures_cannot_specify_parameter_properties,
        Function_implementation_expected,
        Constructor_implementation_expected,
        Function_overload_name_must_be__0_,
        _0__modifier_cannot_appear_on_a_module_element,
        _declare__modifier_cannot_appear_on_an_interface_declaration,
        _declare__modifier_required_for_top_level_element,
        _set__accessor_must_have_only_one_parameter,
        _set__accessor_parameter_cannot_have_accessibility_modifier,
        _set__accessor_parameter_cannot_be_optional,
        _set__accessor_parameter_cannot_have_initializer,
        _set__accessor_cannot_have_rest_parameter,
        _get__accessor_cannot_have_parameters,





        // Semantic diagnostics.
        Duplicate_identifier__0_,
        The_name__0__does_not_exist_in_the_current_scope,
        The_name__0__does_not_refer_to_a_value,
        Keyword__super__can_only_be_used_inside_a_class_instance_method,
        The_left_hand_side_of_an_assignment_expression_must_be_a_variable__property_or_indexer,
        Value_of_type__0__is_not_callable__Did_you_mean_to_include__new__,
        Value_of_type__0__is_not_callable,
        Value_of_type__0__is_not_newable,
        Value_of_type__0__is_not_indexable_by_type__1_,
        Operator__0__cannot_be_applied_to_types__1__and__2_,
        Operator__0__cannot_be_applied_to_types__1__and__2__3,
        Cannot_convert__0__to__1_,
        Cannot_convert__0__to__1___2,
        Expected_var__class__interface__or_module,
        Operator__0__cannot_be_applied_to_type__1_,
        Getter__0__already_declared,
        Setter__0__already_declared,
        Accessor_may_not_take_type_parameters,
        Rest_parameter_cannot_be_optional,
        Rest_parameter_cannot_have_initializer,
        Use_of_deprecated_bool_type,



        // Privacy error messages
        Exported_class__0__extends_private_class__1_,
        Exported_class__0__implements_private_interface__1_,
        Exported_interface__0__extends_private_interface__1_,
        Exported_class__0__extends_class_from_inaccessible_module__1_,
        Exported_class__0__implements_interface_from_inaccessible_module__1_,
        Exported_interface__0__extends_interface_from_inaccessible_module__1_,
        Public_static_property__0__of__exported_class_has_or_is_using_private_type__1_,
        Public_property__0__of__exported_class_has_or_is_using_private_type__1_,
        Property__0__of__exported_interface_has_or_is_using_private_type__1_,
        Exported_variable__0__has_or_is_using_private_type__1_,
        Public_static_property__0__of__exported_class_is_using_inaccessible_module__1_,
        Public_property__0__of__exported_class_is_using_inaccessible_module__1_,
        Property__0__of__exported_interface_is_using_inaccessible_module__1_,
        Exported_variable__0__is_using_inaccessible_module__1_,
        Parameter__0__of_constructor_from_exported_class_has_or_is_using_private_type__1_,
        Parameter__0__of_public_static_property_setter_from_exported_class_has_or_is_using_private_type__1_,
        Parameter__0__of_public_property_setter_from_exported_class_has_or_is_using_private_type__1_,
        Parameter__0__of_constructor_signature_from_exported_interface_has_or_is_using_private_type__1_,
        Parameter__0__of_call_signature_from_exported_interface_has_or_is_using_private_type__1_,
        Parameter__0__of_public_static_method_from_exported_class_has_or_is_using_private_type__1_,
        Parameter__0__of_public_method_from_exported_class_has_or_is_using_private_type__1_,
        Parameter__0__of_method_from_exported_interface_has_or_is_using_private_type__1_,
        Parameter__0__of_exported_function_has_or_is_using_private_type__1_,
        Parameter__0__of_constructor_from_exported_class_is_using_inaccessible_module__1_,
        Parameter__0__of_public_static_property_setter_from_exported_class_is_using_inaccessible_module__1_,
        Parameter__0__of_public_property_setter_from_exported_class_is_using_inaccessible_module__1_,
        Parameter__0__of_constructor_signature_from_exported_interface_is_using_inaccessible_module__1_,
        Parameter__0__of_call_signature_from_exported_interface_is_using_inaccessible_module__1_,
        Parameter__0__of_public_static_method_from_exported_class_is_using_inaccessible_module__1_,
        Parameter__0__of_public_method_from_exported_class_is_using_inaccessible_module__1_,
        Parameter__0__of_method_from_exported_interface_is_using_inaccessible_module__1_,
        Parameter__0__of_exported_function_is_using_inaccessible_module__1_,
        Return_type_of_public_static_property_getter_from_exported_class_has_or_is_using_private_type__0_,
        Return_type_of_public_property_getter_from_exported_class_has_or_is_using_private_type__0_,
        Return_type_of_constructor_signature_from_exported_interface_has_or_is_using_private_type__0_,
        Return_type_of_call_signature_from_exported_interface_has_or_is_using_private_type__0_,
        Return_type_of_index_signature_from_exported_interface_has_or_is_using_private_type__0_,
        Return_type_of_public_static_method_from_exported_class_has_or_is_using_private_type__0_,
        Return_type_of_public_method_from_exported_class_has_or_is_using_private_type__0_,
        Return_type_of_method_from_exported_interface_has_or_is_using_private_type__0_,
        Return_type_of_exported_function_has_or_is_using_private_type__0_,
        Return_type_of_public_static_property_getter_from_exported_class_is_using_inaccessible_module__0_,
        Return_type_of_public_property_getter_from_exported_class_is_using_inaccessible_module__0_,
        Return_type_of_constructor_signature_from_exported_interface_is_using_inaccessible_module__0_,
        Return_type_of_call_signature_from_exported_interface_is_using_inaccessible_module__0_,
        Return_type_of_index_signature_from_exported_interface_is_using_inaccessible_module__0_,
        Return_type_of_public_static_method_from_exported_class_is_using_inaccessible_module__0_,
        Return_type_of_public_method_from_exported_class_is_using_inaccessible_module__0_,
        Return_type_of_method_from_exported_interface_is_using_inaccessible_module__0_,
        Return_type_of_exported_function_is_using_inaccessible_module__0_,


        _new_T____cannot_be_used_to_create_an_array__Use__new_Array_T_____instead,
        A_parameter_list_must_follow_a_generic_type_argument_list______expected,
        Multiple_constructor_implementations_are_not_allowed,
        Unable_to_resolve_external_module__0_,
        Module_cannot_be_aliased_to_a_non_module_type,
        A_class_may_only_extend_another_class,
        A_class_may_only_implement_another_class_or_interface,
        An_interface_may_only_extend_another_class_or_interface,
        An_interface_may_not_implement_another_type,
        Unable_to_resolve_type,
        Unable_to_resolve_type_of__0_,
        Unable_to_resolve_type_parameter_constraint,
        Type_parameter_constraint_may_not_be_a_primitive_type,
        Supplied_parameters_do_not_match_any_signature_of_call_target,
        Supplied_parameters_do_not_match_any_signature_of_call_target___0,
        Invalid__new__expression,
        Call_signatures_used_in_a__new__expression_must_have_a__void__return_type,
        Could_not_select_overload_for__new__expression,
        Type__0__does_not_satisfy_the_constraint__1__for_type_parameter__2_,
        Could_not_select_overload_for__call__expression,
        Unable_to_invoke_type_with_no_call_signatures,
        Calls_to__super__are_only_valid_inside_a_class,
        Generic_type__0__requires_1_type_argument_s_,
        Type_of_conditional_expression_cannot_be_determined__Best_common_type_could_not_be_found_between__0__and__1_,
        Type_of_array_literal_cannot_be_determined__Best_common_type_could_not_be_found_for_array_elements,
        Could_not_find_enclosing_symbol_for_dotted_name__0_,
        Could_not_find_dotted_name__0_,
        Could_not_find_symbol__0_,
        _get__and__set__accessor_must_have_the_same_type,
        _this__may_not_be_referenced_in_current_location,
        Static_methods_may_not_reference_class_type_parameters,

        // Class inheritance errors
        Class__0__is_recursively_referenced_as_a_base_type_of_itself,
        Interface__0__is_recursively_referenced_as_a_base_type_of_itself,

        // Super validation errors
        Super_property_access_is_permitted_only_in_a_constructor__instance_member_function__or_instance_member_accessor_of_a_derived_class,
        _super__may_not_be_referenced_in_non_derived_classes,
        If_a_derived_class_contains_initialized_properties_or_constructor_parameter_properties___the_first_statement_in_the_constructor_body_must_be_a_call_to_the_super_constructor,
        Constructors_for_derived_classes_must_contain_a_call_to_the_class_s__super__constructor,
        Super_calls_are_not_permitted_outside_constructors_or_in_local_functions_inside_constructors,
    }
}