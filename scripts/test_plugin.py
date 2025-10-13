#!/usr/bin/env python3
"""
Unit tests to verify the DocusaurusPlugin functionality using PyUnit
"""

import sys
import os
import unittest
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

from plugin import DocusaurusPlugin


class TestDocusaurusPlugin(unittest.TestCase):
    """Test cases for DocusaurusPlugin functionality"""
    
    def setUp(self):
        """Set up test fixtures before each test method."""
        self.plugin = DocusaurusPlugin()
    
    def test_class_name_conversion(self):
        """Test className to class attribute conversion"""
        test_html = '''
    <div className="test-class">Hello</div>
    <span className='another-class'>World</span>
    <p className={dynamic-class}>Dynamic</p>
    '''
        
        expected_html = '''
    <div class="test-class">Hello</div>
    <span class='another-class'>World</span>
    <p class="dynamic-class">Dynamic</p>
    '''
        
        result_html = self.plugin.parseClassNames(test_html)
        self.assertEqual(result_html.strip(), expected_html.strip(),
                        "ClassName conversion should convert all className attributes to class")
    
    def test_link_fixing(self):
        """Test internal link fixing"""
        test_markdown = '''
    [Link to guide](/guides/authentication/)
    [Link to config](/radix-config)
    [Link to job api](/guides/jobs/job-manager-and-job-api)
    [Link with anchor](/guides/deploy-only#section)
    [External link](https://example.com)
    [Already fixed](/guides/test/index.md)
    Radix allows to configure build in [authentication component](/radix-config#authentication)
    '''
        
        expected_markdown = '''
    [Link to guide](/guides/authentication/index.md)
    [Link to config](/radix-config.md)
    [Link to job api](/guides/jobs/job-manager-and-job-api.md)
    [Link with anchor](/guides/deploy-only.md#section)
    [External link](https://example.com)
    [Already fixed](/guides/test/index.md)
    Radix allows to configure build in [authentication component](/radix-config/index.md#authentication)
    '''
        
        result_markdown = self.plugin.fixDocLinks(test_markdown)
        self.assertEqual(result_markdown.strip(), expected_markdown.strip(),
                        "Link fixing should append .md or /index.md to internal links")
    
    def test_admonition_conversion(self):
        """Test Docusaurus to MkDocs admonition conversion"""
        test_admonitions = '''
:::tip
This is a basic tip
:::

:::note Custom Title
This is a note with a custom title
Multiple lines of content
:::

:::caution
This should become a warning
:::

:::danger Important Warning
Critical information here
:::

:::info
Simple info block
:::
'''
        
        expected_admonitions = '''
!!! tip
    This is a basic tip

!!! note "Custom Title"
    This is a note with a custom title
    Multiple lines of content

!!! warning
    This should become a warning

!!! danger "Important Warning"
    Critical information here

!!! info
    Simple info block
'''
        
        result_admonitions = self.plugin.convertAdmonitions(test_admonitions)
        self.assertEqual(result_admonitions.strip(), expected_admonitions.strip(),
                        "Admonition conversion should convert Docusaurus-style to MkDocs-style")
    
    def test_combined_processing(self):
        """Test that all processing steps work together correctly"""
        test_content = '''# Test Document

This is a [link to docs](/docs/guide) and another [link](../other).

<div className="custom-style">
Content with className
</div>

:::tip Important
This is an important tip with a [link to config](/radix-config/)
:::

More content with className="another-class".
'''
        
        expected_content = '''# Test Document

This is a [link to docs](/docs/guide/index.md) and another [link](../other/index.md).

<div class="custom-style">
Content with className
</div>

!!! tip "Important"
    This is an important tip with a [link to config](/radix-config/index.md)

More content with class="another-class".
'''
        
        result_content = self.plugin.on_page_markdown(test_content, None, None, None)
        self.assertEqual(result_content.strip(), expected_content.strip(),
                        "Combined processing should apply all transformations correctly")
    
    def test_admonition_type_mapping(self):
        """Test that admonition types are mapped correctly"""
        # Test caution -> warning mapping
        caution_input = ''':::caution\nBe careful\n:::'''
        caution_expected = '''!!! warning\n    Be careful'''
        caution_result = self.plugin.convertAdmonitions(caution_input)
        self.assertEqual(caution_result.strip(), caution_expected.strip(),
                        "Caution should be mapped to warning")
        
        # Test other types remain unchanged
        tip_input = ''':::tip\nHelpful tip\n:::'''
        tip_expected = '''!!! tip\n    Helpful tip'''
        tip_result = self.plugin.convertAdmonitions(tip_input)
        self.assertEqual(tip_result.strip(), tip_expected.strip(),
                        "Tip should remain as tip")
    
    def test_external_links_unchanged(self):
        """Test that external links are not modified"""
        test_markdown = '''
    [External HTTP](http://example.com)
    [External HTTPS](https://example.com)
    [Mailto](mailto:test@example.com)
    [Anchor only](#section)
    '''
        
        result_markdown = self.plugin.fixDocLinks(test_markdown)
        self.assertEqual(result_markdown.strip(), test_markdown.strip(),
                        "External links should not be modified")


# Custom test result to handle exit codes
class CustomTestResult(unittest.TextTestResult):
    def __init__(self, stream, descriptions, verbosity):
        super().__init__(stream, descriptions, verbosity)
        self.success_count = 0
        self.failure_count = 0
        self.error_count = 0
    
    def addSuccess(self, test):
        super().addSuccess(test)
        self.success_count += 1
    
    def addError(self, test, err):
        super().addError(test, err)
        self.error_count += 1
    
    def addFailure(self, test, err):
        super().addFailure(test, err)
        self.failure_count += 1


if __name__ == "__main__":
    # Create custom test runner
    runner = unittest.TextTestRunner(
        verbosity=2,
        resultclass=CustomTestResult,
        stream=sys.stdout
    )
    
    # Discover and run tests
    loader = unittest.TestLoader()
    suite = loader.loadTestsFromTestCase(TestDocusaurusPlugin)
    result = runner.run(suite)
    
    # Print summary
    total_tests = result.success_count + result.failure_count + result.error_count
    print(f"\nRan {total_tests} tests")
    print(f"Successes: {result.success_count}")
    print(f"Failures: {result.failure_count}")
    print(f"Errors: {result.error_count}")
    
    # Exit with appropriate code
    if result.failure_count > 0 or result.error_count > 0:
        print(f"Tests completed with {result.failure_count + result.error_count} failure(s)")
        sys.exit(2)
    else:
        print("All tests passed!")
        sys.exit(0)